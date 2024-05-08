import React from 'react';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

// reprevents a column showing which queue a queue entry belongs to
export const QueueTableQueueNameCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queue.display}</>;
};

export const queueTableQueueNameColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableQueueNameCell,
  getFilterableValue: (queueEntry) => queueEntry.queue.display,
});
