import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import type { ConfigObject } from '../config-schema';
import QueueTableMetricsCard from '../queue-table/queue-table-metrics-card.component';
import { useTranslation } from 'react-i18next';
import { useConcept } from '../hooks/useConcept';
import StatusQueueMetrics from './status-queue-table-metric-card.component';

interface WaitingStatusQueueMetricsProps {
  queueUuid: string;
  statusUuid?: string;
}

export default function WaitingStatusQueueMetrics({ queueUuid, statusUuid }: WaitingStatusQueueMetricsProps) {
  const config = useConfig<ConfigObject>();

  if (!config?.concepts?.waitingQueueStatusConceptUuid) {
    console.error(new Error('No concept UUID found for Queue Status = Waiting'));
    return null;
  }

  return <StatusQueueMetrics queueUuid={queueUuid} statusUuid={config?.concepts?.waitingQueueStatusConceptUuid} />;
}
