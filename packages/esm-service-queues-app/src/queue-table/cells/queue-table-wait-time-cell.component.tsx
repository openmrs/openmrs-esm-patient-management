import React from 'react';
import dayjs from 'dayjs';
import QueueDuration from '../../queue-entry-table-components/queue-duration.component';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const startedAt = dayjs(queueEntry.startedAt).toDate();
  const endedAt = queueEntry.endedAt ? dayjs(queueEntry.endedAt).toDate() : null;
  return <QueueDuration startedAt={startedAt} endedAt={endedAt} />;
};

export const queueTableWaitTimeColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
});
