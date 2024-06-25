import React, { useState, useEffect } from 'react';
import { Button, Collapse, InlineField, InlineFieldRow, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { MyDataSourceOptions, MyQuery, MyVariableQuery } from '../types';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions, MyVariableQuery>;

export const Headers = ({ query, onChange }: Props) => {
  const [isHeaderCollapseOpen, setIsHeaderCollapseOpen] = useState(false);
  const [currentHeaders, setCurrentHeaders] = useState(cloneDeep(query.headers));

  useEffect(() => {
    console.log('currentHeaders updated:', currentHeaders);
  }, [currentHeaders]);

  const deleteHeader = (index: number) => {
    let newHeaders = cloneDeep(currentHeaders);
    newHeaders.splice(index, 1);
    setCurrentHeaders(newHeaders);
    onChange({ ...query, headers: newHeaders });
  };

  const addHeader = () => {
    let newHeaders = cloneDeep(currentHeaders);
    newHeaders.push({ key: `header-key${newHeaders.length}`, value: `header-value${newHeaders.length}`, id: uuidv4() });
    setCurrentHeaders(newHeaders);
    onChange({ ...query, headers: newHeaders });
  };

  const updateHeader = (index: number, key: string, value: string) => {
    let newHeaders = cloneDeep(currentHeaders);
    if (key === 'key') {
      newHeaders[index].key = value;
    } else if (key === 'value') {
      newHeaders[index].value = value;
    }
    setCurrentHeaders(newHeaders);
    onChange({ ...query, headers: newHeaders });
  };

  return (
    <>
      <Collapse
        label="Headers"
        isOpen={isHeaderCollapseOpen}
        collapsible={true}
        onToggle={(isOpen) => setIsHeaderCollapseOpen(isOpen)}
      >
        <InlineFieldRow>
          <InlineField>
            <Button variant="success" onClick={() => addHeader()}>
              Add new header
            </Button>
          </InlineField>
        </InlineFieldRow>
        {currentHeaders.map((header, index) => (
          <InlineFieldRow key={header.id}>
            <InlineField label="Key" labelWidth={10}>
              <Input defaultValue={header.key} onBlur={(e) => updateHeader(index, 'key', e.currentTarget.value)} />
            </InlineField>
            <InlineField label="Value" labelWidth={10}>
              <Input defaultValue={header.value} onBlur={(e) => updateHeader(index, 'value', e.currentTarget.value)} />
            </InlineField>
            <InlineField>
              <Button icon="trash-alt" variant="destructive" onClick={() => deleteHeader(index)} />
            </InlineField>
          </InlineFieldRow>
        ))}
      </Collapse>
    </>
  );
};
