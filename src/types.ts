import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  isQueryEditor: boolean;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  isQueryEditor: true,
};

export interface MyVariableQuery extends DataQuery {
  url: string;
}

export const DEFAULT_VARIABLE_QUERY: Partial<MyVariableQuery> = {
  url: 'http://jsonplaceholder.typicode.com/users',
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
