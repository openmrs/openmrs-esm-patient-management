import React from 'react';
import QueuePriority from '../../queue-entry-table-components/queue-priority.component';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueuePriority priority={queueEntry.priority} priorityComment={queueEntry.priorityComment} />;
};

export const queueTablePriorityColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTablePriorityCell,
  getFilterableValue: (queueEntry) => queueEntry.priority.display,
});
