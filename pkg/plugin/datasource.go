package plugin

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/tracing"
	"github.com/grafana/grafana-plugin-sdk-go/data"

	"go.opentelemetry.io/otel/attribute"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces - only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

var (
	errRemoteRequest  = errors.New("remote request error")
	errRemoteResponse = errors.New("remote response error")
)

// NewDatasource creates a new datasource instance.
func NewDatasource(ctx context.Context, settings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	// opts, err := settings.HTTPClientOptions(ctx)
	// if err != nil {
	// 	return nil, fmt.Errorf("http client options: %w", err)
	// }
	// cl, err := httpclient.New(opts)
	// if err != nil {
	// 	return nil, fmt.Errorf("httpclient new: %w", err)
	// }
	// Uncomment the following to forward all HTTP headers in the requests made by the client
	// (disabled by default since SDK v0.161.0)
	// opts.ForwardHTTPHeaders = true

	// Using httpclient.New without any provided httpclient.Options creates a new HTTP client with a set of
	// default middlewares (httpclient.DefaultMiddlewares) providing additional built-in functionality, such as:
	//	- TracingMiddleware (creates spans for each outgoing HTTP request)
	//	- BasicAuthenticationMiddleware (populates Authorization header if basic authentication been configured via the
	//		DataSourceHttpSettings component from @grafana/ui)
	//	- CustomHeadersMiddleware (populates headers if Custom HTTP Headers been configured via the DataSourceHttpSettings
	//		component from @grafana/ui)
	//	- ContextualMiddleware (custom middlewares per context.Context, see httpclient.WithContextualMiddleware)
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	cl := &http.Client{Transport: tr}
	return &Datasource{
		settings:   settings,
		httpClient: cl,
	}, nil
}

// DatasourceOpts contains the default ManageOpts for the datasource.
var DatasourceOpts = datasource.ManageOpts{
	TracingOpts: tracing.Opts{
		// Optional custom attributes attached to the tracer's resource.
		// The tracer will already have some SDK and runtime ones pre-populated.
		CustomAttributes: []attribute.KeyValue{
			attribute.String("my_plugin.my_attribute", "custom value"),
		},
	},
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct{
	settings backend.DataSourceInstanceSettings

	httpClient *http.Client
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
	d.httpClient.CloseIdleConnections()
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

type queryModel struct{}

func (d *Datasource) query(ctx context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	var response backend.DataResponse

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	err := json.Unmarshal(query.JSON, &qm)
	if err != nil {
		return backend.ErrDataResponse(backend.StatusBadRequest, fmt.Sprintf("json unmarshal: %v", err.Error()))
	}

	// create data frame response.
	// For an overview on data frames and how grafana handles them:
	// https://grafana.com/developers/plugin-tools/introduction/data-frames
	frame := data.NewFrame("response")

	// add fields.
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, []time.Time{query.TimeRange.From, query.TimeRange.To}),
		data.NewField("values", nil, []int64{10, 20}),
	)

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	ctxLogger := log.DefaultLogger.FromContext(ctx)

	r, err := http.NewRequestWithContext(ctx, http.MethodGet, "http://jsonplaceholder.typicode.com/users", nil)
	if err != nil {
		return newHealthCheckErrorf("could not create request"), nil
	}
	resp, err := d.httpClient.Do(r)
	if err != nil {
		return newHealthCheckErrorf("request error"), nil
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			ctxLogger.Error("check health: failed to close response body", "err", err.Error())
		}
	}()
	if resp.StatusCode != http.StatusOK {
		return newHealthCheckErrorf("got response code %d", resp.StatusCode), nil
	}
	resp.Header.Get("Server")
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: "Data source is working. Header: " + resp.Header.Get("Server"),
	}, nil
}

// newHealthCheckErrorf returns a new *backend.CheckHealthResult with its status set to backend.HealthStatusError
// and the specified message, which is formatted with Sprintf.
func newHealthCheckErrorf(format string, args ...interface{}) *backend.CheckHealthResult {
	return &backend.CheckHealthResult{Status: backend.HealthStatusError, Message: fmt.Sprintf(format, args...)}
}

func (d *Datasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	requestBody := &apiQuery{}
	err := json.Unmarshal(req.Body, requestBody)
	if err != nil {
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusBadRequest,
		})
	}
	switch req.Path {
	case "variable-header":
		var body io.Reader
		if requestBody.Method.Value == "POST" {
			body = strings.NewReader(requestBody.PostBody)
		} else {
			body = nil
		}
		r, err := http.NewRequestWithContext(ctx, requestBody.Method.Value, requestBody.URL, body)
		if err != nil {
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusBadRequest,
			})
		}
		// apply headers
		for _, header := range requestBody.Headers {
			r.Header.Set(header.Key, header.Value)
		}

		resp, err := d.httpClient.Do(r)
		if err != nil {
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusBadRequest,
				Body: []byte(err.Error()),
			})
		}
		headerValue := resp.Header.Get(requestBody.HeaderToReturn)
		jsonBody := fmt.Sprintf(`{"header": "%s" }`, headerValue)
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   []byte(jsonBody),7
		})
	case "example":
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusNotFound,
		})
	default:
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusNotFound,
		})
	}
}