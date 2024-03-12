import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';

// reprevents a column showing which queue a queue entry belongs to
export const QueueTableQueueCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queue.display}</>;
};

export const queueTableQueueColumn: QueueTableColumn = {
  headerI18nKey: 'queue',
  CellComponent: QueueTableQueueCell,
  getFilterableValue: (queueEntry) => queueEntry.queue.display,
};
