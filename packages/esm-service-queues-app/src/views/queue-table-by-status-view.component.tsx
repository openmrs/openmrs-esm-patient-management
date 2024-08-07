import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import QueueTablesForAllStatuses from './queue-tables-for-all-statuses.component';

const QueueTableByStatusView: React.FC = () => {
  const { queueUuid, statusUuid } = useParams();
  const { queue, isLoading: isLoadingQueue, error } = useQueue(queueUuid);

  return <QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={isLoadingQueue} errorFetchingQueue={error} />;
};

export default QueueTableByStatusView;
