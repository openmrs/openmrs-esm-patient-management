import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueueStatus from '../../queue-entry-table-components/queue-status.component';

export const QueueTableStatusCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueueStatus status={queueEntry.status} />; // Do not pass queue into status, as we do not want to render it
};

export const queueTableStatusColumn: QueueTableColumn = {
  headerI18nKey: 'status',
  CellComponent: QueueTableStatusCell,
  getFilterableValue: (queueEntry) => queueEntry.status.display,
};
