import React from 'react';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

// reprevents a column showing which queue a queue entry belongs to
export const QueueTableQueueCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queue.display}</>;
};

export const queueTableQueueColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableQueueCell,
  getFilterableValue: (queueEntry) => queueEntry.queue.display,
});
