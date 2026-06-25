import React from 'react';
import { useQueue } from '../hooks/useQueue';
import SwrConfig from '../swr-config.component';
import QueueTablesForAllStatuses from './queue-tables-for-all-statuses.component';

interface QueueTableByStatusViewProps {
  queueUuid: string;
}

/**
 * This component renders the several tables, one for each status, for a given queue.
 */
const QueueTableByStatusView: React.FC<QueueTableByStatusViewProps> = ({ queueUuid }) => {
  const { queue, isLoading: isLoadingQueue, error } = useQueue(queueUuid);

  return (
    <SwrConfig>
      <QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={isLoadingQueue} errorFetchingQueue={error} />
    </SwrConfig>
  );
};

export default QueueTableByStatusView;
