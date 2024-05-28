import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueueEntries, useQueueEntriesMetrics } from '../hooks/useQueueEntries';
import QueueTableMetricsCard from './queue-table-metrics-card.component';
import styles from './queue-table-metrics.scss';
import { type Queue } from '../types';

interface QueueTableMetricsProps {
  selectedQueue: Queue;
}

function QueueTableMetrics({ selectedQueue }: QueueTableMetricsProps) {
  const { t } = useTranslation();

  const allowedStatuses = selectedQueue.allowedStatuses;
  const { count, averageWaitTime } = useQueueEntriesMetrics({ queue: selectedQueue.uuid, isEnded: false });

  return (
    <div className={styles.metricsBorder}>
      <QueueTableMetricsCard value={count} headerLabel={t('totalPatients', 'Total Patients')} />
      {allowedStatuses?.map((status) => {
        return (
          <QueueTableMetricsCard queueUuid={selectedQueue.uuid} status={status.uuid} headerLabel={status.display} />
        );
      })}
      <QueueTableMetricsCard
        queueUuid={selectedQueue.uuid}
        status={null}
        headerLabel={t('averageWaitingTimeTitle', 'Average waiting time')}
        value={!isNaN(averageWaitTime) ? averageWaitTime : 0}
      />
    </div>
  );
}

export default QueueTableMetrics;
