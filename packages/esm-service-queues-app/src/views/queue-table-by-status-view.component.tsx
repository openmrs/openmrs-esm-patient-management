import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import QueueTablesForAllStatuses from './queue-tables-for-all-statuses.component';

interface QueueTableByStatusViewProps {
  /**
   * If provided, this will be used to fetch the queue instead of the one in the URL.
   * This is useful for when this component is used as an extension.
   */
  customQueueUuid?: string;
}

const QueueTableByStatusView: React.FC<QueueTableByStatusViewProps> = ({ customQueueUuid }) => {
  const { queueUuid } = useParams();
  const { queue, isLoading: isLoadingQueue, error } = useQueue(customQueueUuid ?? queueUuid);

  return <QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={isLoadingQueue} errorFetchingQueue={error} />;
};

export default QueueTableByStatusView;
