import React from 'react';
import QueuePriority from '../components/queue-priority.component';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { useConfig } from '@openmrs/esm-framework';

export const queueTablePriorityColumn: QueueTableColumnFunction = (key, header) => {
  const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    const { priorityConfigs } = useConfig<ConfigObject>();

    return (
      <QueuePriority
        priority={queueEntry.priority}
        priorityComment={queueEntry.priorityComment}
        priorityConfigs={priorityConfigs}
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
