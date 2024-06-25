import {
  DataSourceInstanceSettings,
  CoreApp,
  ScopedVars,
  LegacyMetricFindQueryOptions,
  MetricFindValue,
} from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';

import { MyQuery, MyDataSourceOptions, DEFAULT_QUERY, MyVariableQuery } from './types';
import { MyCustomVariableSupport } from './variables';

export class DataSource extends DataSourceWithBackend<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.variables = new MyCustomVariableSupport(this);
  }

  async metricFindQuery(
    query: MyVariableQuery,
    options?: LegacyMetricFindQueryOptions | undefined
  ): Promise<MetricFindValue[]> {
    console.log('variable query: ', query);
    const variableHeaderResource = await this.postResource('variable-header', query);
    const variable = [{ text: variableHeaderResource.header, value: variableHeaderResource.header }];
    console.log('variable result: ', variable);
    return variable;
  }

  getDefaultQuery(_: CoreApp): Partial<MyQuery> {
    return DEFAULT_QUERY;
  }

  applyTemplateVariables(query: MyQuery, scopedVars: ScopedVars): Record<string, any> {
    return {
      ...query,
    };
  }

  filterQuery(query: MyQuery): boolean {
    // if no query has been provided, prevent the query from being executed
    return !query.isQueryEditor;
  }
}
