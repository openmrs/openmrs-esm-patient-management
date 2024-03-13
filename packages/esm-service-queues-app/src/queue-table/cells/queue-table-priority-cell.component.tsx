import { Tag } from '@carbon/react';
import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueuePriority from '../../queue-entry-table-components/queue-priority.component';

export const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueuePriority priority={queueEntry.priority} priorityComment={queueEntry.priorityComment} />;
};

export const queueTablePriorityColumn: QueueTableColumn = {
  headerI18nKey: 'priority',
  CellComponent: QueueTablePriorityCell,
  getFilterableValue: (queueEntry) => queueEntry.priority.display,
};
