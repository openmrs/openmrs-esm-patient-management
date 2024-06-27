import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import type { ConfigObject } from '../config-schema';
import StatusQueueMetrics from './status-queue-table-metric-card.component';

interface InServiceStatusQueueMetricsProps {
  queueUuid: string;
  statusUuid: string;
}

export default function InServiceStatusQueueMetrics({ queueUuid, statusUuid }: InServiceStatusQueueMetricsProps) {
  const config = useConfig<ConfigObject>();

  if (!config?.concepts?.inServiceQueueStatusConceptUuid) {
    console.error(new Error('No concept UUID found for Queue Status = In service'));
    return null;
  }

  return <StatusQueueMetrics queueUuid={queueUuid} statusUuid={config?.concepts?.inServiceQueueStatusConceptUuid} />;
}
