import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueueStatus from '../../queue-entry-table-components/queue-status.component';
import { translateFrom } from '@openmrs/esm-framework';

export const QueueTableStatusCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <QueueStatus status={queueEntry.status} />; // Do not pass queue into status, as we do not want to render it
};

export const queueTableStatusColumn: QueueTableColumn = {
  header: translateFrom('@openmrs/esm-service-queues-app', 'status', 'Status'),
  CellComponent: QueueTableStatusCell,
  getFilterableValue: (queueEntry) => queueEntry.status.display,
};
