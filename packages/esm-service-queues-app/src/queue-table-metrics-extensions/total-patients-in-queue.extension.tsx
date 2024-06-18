import React from 'react';
import { useTranslation } from 'react-i18next';
import QueueTableMetricsCard from '../queue-table/queue-table-metrics-card.component';
import { useQueueEntriesMetrics } from '../hooks/useQueueEntries';

interface TotalPatientsInQueueMetricsProps {
  queueUuid: string;
  statusUuid: string;
}

export default function TotalPatientsInQueueMetrics({ queueUuid, statusUuid }: TotalPatientsInQueueMetricsProps) {
  const { t } = useTranslation();
  const { count } = useQueueEntriesMetrics({
    queue: queueUuid,
    isEnded: false,
  });

  return (
    <QueueTableMetricsCard
      value={count}
      headerLabel={t('totalPatients', 'Total Patients')}
      linkTo={`\${openmrsSpaBase}/home/service-queues/queue-table-by-status/${queueUuid}`}
    />
  );
}
