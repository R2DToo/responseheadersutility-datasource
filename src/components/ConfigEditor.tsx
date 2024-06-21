import React from 'react';
import { Alert } from '@grafana/ui';

export function ConfigEditor() {
  return (
    <>
      <Alert title="This plugin does not require any configuration" severity="info"></Alert>
    </>
  );
}
