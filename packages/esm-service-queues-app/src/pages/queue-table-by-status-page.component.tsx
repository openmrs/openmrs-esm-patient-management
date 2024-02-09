import { InlineNotification } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import { QueueTableByStatus } from '../queue-table/queue-table-by-status.component';

export const QueueTableByStatusPage: React.FC = () => {
  const { queueUuid, statusUuid } = useParams();
  const { queue, isLoading } = useQueue(queueUuid);
  const status = queue?.allowedStatuses.find((s) => s.uuid == statusUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <>{t('loading', 'Loading...')}</>;
  } else if (!queue) {
    return <InlineNotification kind="error" title={t('invalidQueue', 'Invalid Queue')} />;
  } else {
    return <QueueTableByStatus queue={queue} status={status} />;
  }
};
