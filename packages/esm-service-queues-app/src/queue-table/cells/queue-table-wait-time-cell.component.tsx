import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueueDuration from '../../queue-entry-table-components/queue-duration.component';
import dayjs from 'dayjs';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const startedAt = dayjs(queueEntry.startedAt).toDate();
  const endedAt = queueEntry.endedAt ? dayjs(queueEntry.endedAt).toDate() : null;
  return <QueueDuration startedAt={startedAt} endedAt={endedAt} />;
};

export const queueTableWaitTimeColumn: QueueTableColumn = {
  headerI18nKey: 'waitTime',
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
};
