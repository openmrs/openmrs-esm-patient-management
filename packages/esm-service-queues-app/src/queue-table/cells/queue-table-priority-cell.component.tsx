import React from 'react';
import QueuePriority from '../components/queue-priority.component';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';
import { type PriorityColumnConfig } from '../../config-schema';

export const queueTablePriorityColumn: QueueTableColumnFunction = (key, header, config: PriorityColumnConfig) => {
  const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    return (
      <QueuePriority
        priority={queueEntry.priority}
        priorityComment={queueEntry.priorityComment}
        priorityConfigs={config?.priorityConfigs}
      />
    );
  };

  return {
    key,
    header,
    CellComponent: QueueTablePriorityCell,
    getFilterableValue: (queueEntry) => queueEntry.priority.display,
  };
};
