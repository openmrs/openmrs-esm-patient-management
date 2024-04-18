import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueuePriority from '../../queue-entry-table-components/queue-priority.component';
import { translateFrom } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

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
