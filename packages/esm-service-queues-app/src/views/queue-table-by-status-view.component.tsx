import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import QueueTablesForAllStatuses from './queue-tables-for-all-statuses.component';
import { useConcept } from '../hooks/useConcept';

const QueueTableByStatusView: React.FC = () => {
  const { queueUuid, statusUuid } = useParams();
  const { queue, isLoading: isLoadingQueue, error } = useQueue(queueUuid);
  const { concept: status, error: errorFetchingStatus } = useConcept(statusUuid);

  return (
    <QueueTablesForAllStatuses
      selectedQueue={queue}
      isLoadingQueue={isLoadingQueue}
      errorFetchingQueue={error}
      errorFetchingStatus={errorFetchingStatus}
      selectedStatus={status}
    />
  );
};

export default QueueTableByStatusView;
