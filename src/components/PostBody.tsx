import React, { useState, useEffect } from 'react';
import { Button, Collapse, InlineField, InlineFieldRow, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, MyVariableQuery } from '../types';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions, MyVariableQuery>;

export const QueryParams = ({ query, onChange }: Props) => {
  const [isQueryParamsCollapseOpen, setIsQueryParamsCollapseOpen] = useState(false);
  const [currentQueryParams, setCurrentQueryParams] = useState(cloneDeep(query.queryParams));

  useEffect(() => {
    console.log('currentQueryParams updated:', currentQueryParams);
  }, [currentQueryParams]);

  const deleteQueryParam = (index: number) => {
    let newQueryParams = cloneDeep(currentQueryParams);
    newQueryParams.splice(index, 1);
    setCurrentQueryParams(newQueryParams);
    onChange({ ...query, queryParams: newQueryParams });
  };

  const addQueryParam = () => {
    let newQueryParams = cloneDeep(currentQueryParams);
    newQueryParams.push({
      key: `query-param-key${newQueryParams.length}`,
      value: `query-param-value${newQueryParams.length}`,
      id: uuidv4(),
    });
    setCurrentQueryParams(newQueryParams);
    onChange({ ...query, queryParams: newQueryParams });
  };

  const updateQueryParam = (index: number, key: string, value: string) => {
    let newQueryParams = cloneDeep(currentQueryParams);
    if (key === 'key') {
      newQueryParams[index].key = value;
    } else if (key === 'value') {
      newQueryParams[index].value = value;
    }
    setCurrentQueryParams(newQueryParams);
    onChange({ ...query, queryParams: newQueryParams });
  };

  return (
    <>
      <Collapse
        label="Query Parameters"
        isOpen={isQueryParamsCollapseOpen}
        collapsible={true}
        onToggle={(isOpen) => setIsQueryParamsCollapseOpen(isOpen)}
      >
        <InlineFieldRow>
          <InlineField>
            <Button variant="success" onClick={() => addQueryParam()}>
              Add new query parameter
            </Button>
          </InlineField>
        </InlineFieldRow>
        {currentQueryParams.map((queryParam, index) => (
          <InlineFieldRow key={queryParam.id}>
            <InlineField label="Key" labelWidth={10}>
              <Input
                defaultValue={queryParam.key}
                onBlur={(e) => updateQueryParam(index, 'key', e.currentTarget.value)}
              />
            </InlineField>
            <InlineField label="Value" labelWidth={10}>
              <Input
                defaultValue={queryParam.value}
                onBlur={(e) => updateQueryParam(index, 'value', e.currentTarget.value)}
              />
            </InlineField>
            <InlineField>
              <Button icon="trash-alt" variant="destructive" onClick={() => deleteQueryParam(index)} />
            </InlineField>
          </InlineFieldRow>
        ))}
      </Collapse>
    </>
  );
};
