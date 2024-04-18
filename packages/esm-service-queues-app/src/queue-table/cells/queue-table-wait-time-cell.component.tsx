import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import QueueDuration from '../../queue-entry-table-components/queue-duration.component';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const startedAt = dayjs(queueEntry.startedAt).toDate();
  const endedAt = queueEntry.endedAt ? dayjs(queueEntry.endedAt).toDate() : null;
  return <QueueDuration startedAt={startedAt} endedAt={endedAt} />;
};

export const queueTableWaitTimeColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('waitTime', 'Wait time');
  },
  key: 'waitTime',
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
};
