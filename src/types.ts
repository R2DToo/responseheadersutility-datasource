import { DataSourceJsonData, SelectableValue } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

// interface KeyValue {
//   key: string;
//   value: string;
// }

export interface MyQuery extends DataQuery {
  isQueryEditor: boolean;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  isQueryEditor: true,
};

export interface MyVariableQuery extends DataQuery {
  method: SelectableValue<string>;
  url: string;
  headers: Array<{ key: string; value: string; id: string }>;
  postBody: string;
  headerToReturn: string;
}

export const DEFAULT_VARIABLE_QUERY: Partial<MyVariableQuery> = {
  method: { label: 'GET', value: 'GET' },
  url: 'http://jsonplaceholder.typicode.com/users',
  headers: [{ key: 'header-key', value: 'header-value', id: 'nouuid' }],
  postBody: '',
  headerToReturn: '',
};

export interface DataPoint {
  Time: number;
  Value: number;
}

export interface DataSourceResponse {
  datapoints: DataPoint[];
}

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {}
