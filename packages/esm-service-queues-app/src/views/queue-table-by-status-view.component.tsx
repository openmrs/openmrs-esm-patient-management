import React from 'react';
import { useQueue } from '../hooks/useQueue';
import SwrConfig from '../swr-config.component';
import QueueTablesForAllStatuses from './queue-tables-for-all-statuses.component';

interface QueueTableByStatusViewProps {
  queueUuid: string;
}

/**
 * This component renders the several tables, one for each status, for a given queue. Fetching happens
 * in a child so that it too sits under `SwrConfig` and picks up the configured refresh interval.
 */
const QueueTableByStatusView: React.FC<QueueTableByStatusViewProps> = ({ queueUuid }) => (
  <SwrConfig>
    <QueueTablesByStatus queueUuid={queueUuid} />
  </SwrConfig>
);

const QueueTablesByStatus: React.FC<QueueTableByStatusViewProps> = ({ queueUuid }) => {
  const { queue, isLoading: isLoadingQueue, error } = useQueue(queueUuid);

  return <QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={isLoadingQueue} errorFetchingQueue={error} />;
};

export default QueueTableByStatusView;
