package plugin

import "time"

// apiMetrics is a struct containing a slice of dataPoint
type apiMetrics struct {
	DataPoints []apiDataPoint `json:"datapoints"`
}

// apiDataPoint is a single data point with a timestamp and a float value
type apiDataPoint struct {
	Time  time.Time `json:"time"`
	Value float64   `json:"value"`
}

type apiQuery struct {
	Method struct {
		Label string `json:"label"`
		Value string `json:"value"`
	} `json:"method"`
	URL     string `json:"url"`
	PostBody     string `json:"postBody"`
	HeaderToReturn     string `json:"headerToReturn"`
	Headers []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
		ID    string `json:"id"`
	} `json:"headers"`
	QueryParams []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
		ID    string `json:"id"`
	} `json:"queryParams"`
}