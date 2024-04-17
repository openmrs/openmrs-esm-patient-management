import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueuePriority from '../../queue-entry-table-components/queue-priority.component';
import { translateFrom } from '@openmrs/esm-framework';

export const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueuePriority priority={queueEntry.priority} priorityComment={queueEntry.priorityComment} />;
};

export const queueTablePriorityColumn: QueueTableColumn = {
  header: translateFrom('@openmrs/esm-service-queues-app', 'priority', 'Priority'),
  CellComponent: QueueTablePriorityCell,
  getFilterableValue: (queueEntry) => queueEntry.priority.display,
};
