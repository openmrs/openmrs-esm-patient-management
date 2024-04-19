import React from 'react';
import QueueStatus from '../../queue-entry-table-components/queue-status.component';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableStatusCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueueStatus status={queueEntry.status} />; // Do not pass queue into status, as we do not want to render it
};

export const queueTableStatusColumn: QueueTableColumn = (t) => ({
  header: t('status', 'Status'),
  CellComponent: QueueTableStatusCell,
  getFilterableValue: (queueEntry) => queueEntry.status.display,
});
