import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';

const MetricSlot: React.FC = () => {
  return (
    <ExtensionSlot name="metrics-extension-slot" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }} />
  );
};

export default MetricSlot;
