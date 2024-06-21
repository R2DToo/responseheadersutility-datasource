import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CustomVariableSupport, DataQueryRequest, MetricFindValue, ScopedVars, TimeRange } from '@grafana/data';

import { VariableEditor } from './components/VariableEditor';
import { DataSource } from './datasource';
import { MyVariableQuery } from './types';

export class MyCustomVariableSupport extends CustomVariableSupport<DataSource, MyVariableQuery> {
  editor = VariableEditor;

  constructor(private datasource: DataSource) {
    super();
  }

  async execute(query: MyVariableQuery, scopedVars: ScopedVars, range: TimeRange) {
    return this.datasource.metricFindQuery(query, { scopedVars, range });
  }

  query(request: DataQueryRequest<MyVariableQuery>): Observable<{ data: MetricFindValue[] }> {
    const result = this.execute(request.targets[0], request.scopedVars, request.range);

    return from(result).pipe(map((data) => ({ data })));
  }
}
