import React from 'react';
import QueueTableMetricsCard from '../queue-table/queue-table-metrics-card.component';
import { useConcept } from '../hooks/useConcept';

interface StatusQueueMetricsProps {
  queueUuid: string;
  statusUuid: string;
}

export default function StatusQueueMetrics({ queueUuid, statusUuid }: StatusQueueMetricsProps) {
  const { concept, isLoading } = useConcept(statusUuid);

  if (isLoading || !concept) {
    return null;
  }

  return (
    <QueueTableMetricsCard
      queueUuid={queueUuid}
      status={statusUuid}
      headerLabel={concept?.display}
      linkTo={`\${openmrsSpaBase}/home/service-queues/queue-table-by-status/${queueUuid}/${statusUuid}`}
    />
  );
}
