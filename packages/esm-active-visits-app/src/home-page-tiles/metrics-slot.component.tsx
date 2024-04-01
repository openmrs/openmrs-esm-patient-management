import { ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';

const MetricsSlot = () => {
  return (
    <ExtensionSlot
      name="metrics-extension-slot"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', margin: '0 0.5rem' }}
    />
  );
};

export default MetricsSlot;
