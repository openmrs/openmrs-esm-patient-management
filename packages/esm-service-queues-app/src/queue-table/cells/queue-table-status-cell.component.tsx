import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';

const QueueTableStatusCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.status.display}</>;
};

export const queueTableStatusColumn: QueueTableColumn = {
  headerI18nKey: 'status',
  CellComponent: QueueTableStatusCell,
};
