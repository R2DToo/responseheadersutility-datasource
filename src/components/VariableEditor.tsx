import React from 'react';
import { InlineField, InlineFieldRow, Input, Select, TextArea } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, MyVariableQuery, DEFAULT_VARIABLE_QUERY } from '../types';
import { defaults } from 'lodash';
import { Headers } from './Headers';
import { QueryParams } from './QueryParams';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions, MyVariableQuery>;

export function VariableEditor({ query, onChange, onRunQuery, datasource }: Props) {
  query = defaults(query, DEFAULT_VARIABLE_QUERY);
  const METHOD_OPTIONS = [
    {
      label: 'GET',
      value: 'GET',
    },
    {
      label: 'POST',
      value: 'POST',
    },
  ];
  return (
    <>
      <InlineFieldRow>
        <InlineField label="Method" labelWidth={10}>
          <Select
            options={METHOD_OPTIONS}
            value={query.method}
            onChange={(v) => onChange({ ...query, method: v })}
            allowCustomValue={false}
            isClearable={false}
            width={20}
          />
        </InlineField>
        <InlineField label="URL" labelWidth={10}>
          <Input defaultValue={query.url} width={80} onBlur={(e) => onChange({ ...query, url: e.target.value })} />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Header to Return" labelWidth={20}>
          <Input
            defaultValue={query.headerToReturn}
            width={100}
            onBlur={(e) => onChange({ ...query, headerToReturn: e.target.value })}
          />
        </InlineField>
      </InlineFieldRow>
      {query.method.label === 'POST' && (
        <InlineFieldRow>
          <InlineField label="POST Body" labelWidth={20}>
            <TextArea
              defaultValue={query.postBody}
              cols={80}
              rows={4}
              onBlur={(e) => onChange({ ...query, postBody: e.target.value })}
            />
          </InlineField>
        </InlineFieldRow>
      )}
      <Headers query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={datasource} />
      <QueryParams query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={datasource} />
    </>
  );
}
