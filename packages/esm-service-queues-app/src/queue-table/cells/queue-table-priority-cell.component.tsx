import React from 'react';
import QueuePriority from '../../queue-entry-table-components/queue-priority.component';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueuePriority priority={queueEntry.priority} priorityComment={queueEntry.priorityComment} />;
};

export const queueTablePriorityColumn: QueueTableColumn = (t) => ({
  header: t('priority', 'Priority'),
  CellComponent: QueueTablePriorityCell,
  getFilterableValue: (queueEntry) => queueEntry.priority.display,
});
