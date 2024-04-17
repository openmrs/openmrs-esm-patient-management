import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import { translateFrom } from '@openmrs/esm-framework';

// reprevents a column showing which queue a queue entry belongs to
export const QueueTableQueueCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queue.display}</>;
};

export const queueTableQueueColumn: QueueTableColumn = {
  header: translateFrom('@openmrs/esm-service-queues-app', 'queue', 'Queue'),
  CellComponent: QueueTableQueueCell,
  getFilterableValue: (queueEntry) => queueEntry.queue.display,
};
