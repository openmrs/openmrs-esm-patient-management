import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueueEntries } from '../hooks/useQueueEntries';
import QueueTableMetricsCard from './queue-table-metrics-card.component';
import styles from './queue-table-metrics.scss';
import { type Queue } from '../types';

interface QueueTableMetricsProps {
  selectedQueue: Queue;
}

function QueueTableMetrics({ selectedQueue }: QueueTableMetricsProps) {
  const { t } = useTranslation();

  const allowedStatuses = selectedQueue.allowedStatuses;
  const { queueEntries, totalCount } = useQueueEntries({ queue: selectedQueue.uuid, isEnded: false });

  return (
    <div className={styles.metricsBorder}>
      <QueueTableMetricsCard value={totalCount} headerLabel={t('totalPatients', 'Total Patients')} />
      {allowedStatuses?.map((status) => {
        const filteredQueueEntries = queueEntries.filter((queueEntry) => {
          return queueEntry.status.uuid === status.uuid;
        });
        return <QueueTableMetricsCard value={filteredQueueEntries.length} headerLabel={status.display} />;
      })}
    </div>
  );
}

export default QueueTableMetrics;
