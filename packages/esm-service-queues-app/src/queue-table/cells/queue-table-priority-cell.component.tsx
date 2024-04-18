import React from 'react';
import { useTranslation } from 'react-i18next';
import QueuePriority from '../../queue-entry-table-components/queue-priority.component';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueuePriority priority={queueEntry.priority} priorityComment={queueEntry.priorityComment} />;
};

export const queueTablePriorityColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('priority', 'Priority');
  },
  key: 'priority',
  CellComponent: QueueTablePriorityCell,
  getFilterableValue: (queueEntry) => queueEntry.priority.display,
};
