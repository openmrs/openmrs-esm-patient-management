import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import MetricsHeader from './metrics-header.component';
import styles from './metrics-container.scss';

export interface Service {
  display: string;
  uuid?: string;
}

function MetricsContainer() {
  return (
    <>
      <MetricsHeader />
      <ExtensionSlot name="service-queues-metrics-slot" className={styles.cardContainer} data-testid="clinic-metrics" />
    </>
  );
}

export default MetricsContainer;
