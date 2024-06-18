import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import type { ConfigObject } from '../config-schema';
import StatusQueueMetrics from './status-queue-table-metric-card.component';

interface FinishedServiceStatusQueueMetricsProps {
  queueUuid: string;
  statusUuid: string;
}

export default function FinishedServiceStatusQueueMetrics({
  queueUuid,
  statusUuid,
}: FinishedServiceStatusQueueMetricsProps) {
  const config = useConfig<ConfigObject>();

  if (!config?.concepts?.finishedServiceQueueStatusConceptUuid) {
    console.error(new Error('No concept UUID found for Queue Status = Waiting for transfer'));
    return null;
  }

  return (
    <StatusQueueMetrics queueUuid={queueUuid} statusUuid={config?.concepts?.finishedServiceQueueStatusConceptUuid} />
  );
}
