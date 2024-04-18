import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import { translateFrom } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

// reprevents a column showing which queue a queue entry belongs to
export const QueueTableQueueCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queue.display}</>;
};

export const queueTableQueueColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('queue', 'Queue');
  },
  key: 'queue',
  CellComponent: QueueTableQueueCell,
  getFilterableValue: (queueEntry) => queueEntry.queue.display,
};
