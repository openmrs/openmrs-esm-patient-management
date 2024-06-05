import { InlineNotification } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import QueueTableByStatus from '../queue-table/queue-table-by-status.component';
import { QueueTableByStatusSkeleton } from '../queue-table/queue-table-by-status-skeleton.component';
import QueueTablesForAllStatuses from './queue-tables-for-all-statuses.component';

const QueueTableByStatusView: React.FC = () => {
  const { queueUuid, statusUuid } = useParams();
  const { queue, isLoading: isLoadingQueue } = useQueue(queueUuid);
  const status = queue?.allowedStatuses.find((s) => s.uuid == statusUuid);

  return <QueueTablesForAllStatuses selectedQueue={queue} isLoadingQueue={isLoadingQueue} />;
};

export default QueueTableByStatusView;
