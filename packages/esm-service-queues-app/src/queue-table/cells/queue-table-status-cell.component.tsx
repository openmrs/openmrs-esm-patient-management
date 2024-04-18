import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueueStatus from '../../queue-entry-table-components/queue-status.component';
import { translateFrom } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

export const QueueTableStatusCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueueStatus status={queueEntry.status} />; // Do not pass queue into status, as we do not want to render it
};

export const queueTableStatusColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('status', 'Status');
  },
  key: 'status',
  CellComponent: QueueTableStatusCell,
  getFilterableValue: (queueEntry) => queueEntry.status.display,
};
