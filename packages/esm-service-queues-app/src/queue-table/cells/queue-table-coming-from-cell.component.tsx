import React from 'react';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableComingFromCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queueComingFrom?.display}</>;
};

export const queueTableComingFromColumn: QueueTableColumn = (t) => ({
  header: t('queueComingFrom', 'Coming from'),
  CellComponent: QueueTableComingFromCell,
  getFilterableValue: (queueEntry) => queueEntry.queueComingFrom?.display,
});
