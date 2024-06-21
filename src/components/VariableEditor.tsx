import React from 'react';
import { Alert } from '@grafana/ui';

export function VariableEditor() {
  return (
    <>
      <Alert title="This plugin only supports variables" severity="info"></Alert>
    </>
  );
}
