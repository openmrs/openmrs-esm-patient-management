import React from 'react';
import dayjs from 'dayjs';
import QueueDuration from '../../queue-entry-table-components/queue-duration.component';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const startedAt = dayjs(queueEntry.startedAt).toDate();
  const endedAt = queueEntry.endedAt ? dayjs(queueEntry.endedAt).toDate() : null;
  return <QueueDuration startedAt={startedAt} endedAt={endedAt} />;
};

export const queueTableWaitTimeColumn: QueueTableColumn = (t) => ({
  header: t('waitTime', 'Wait time'),
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
});
