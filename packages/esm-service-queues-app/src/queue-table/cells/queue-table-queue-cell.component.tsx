import React from 'react';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

// reprevents a column showing which queue a queue entry belongs to
export const QueueTableQueueCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queue.display}</>;
};

export const queueTableQueueColumn: QueueTableColumn = (t) => ({
  header: t('queue', 'Queue'),
  CellComponent: QueueTableQueueCell,
  getFilterableValue: (queueEntry) => queueEntry.queue.display,
});
