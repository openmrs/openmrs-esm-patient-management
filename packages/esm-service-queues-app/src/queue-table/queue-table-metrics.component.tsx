import React from 'react';
import styles from './queue-table-metrics.scss';
import type { Concept, Queue } from '../types';
import { ExtensionSlot } from '@openmrs/esm-framework';

interface QueueTableMetricsProps {
  selectedQueue: Queue;
  selectedStatus: Concept;
}

function QueueTableMetrics({ selectedQueue, selectedStatus }: QueueTableMetricsProps) {
  return (
    <ExtensionSlot
      name="queue-table-metrics-slot"
      className={styles.metricsBorder}
      state={{ queueUuid: selectedQueue.uuid, statusUuid: selectedStatus?.uuid }}
    />
  );
}

export default QueueTableMetrics;
