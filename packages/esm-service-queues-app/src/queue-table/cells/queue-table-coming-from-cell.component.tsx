import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';

export const QueueTableComingFromCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queueComingFrom?.display}</>;
};

export const queueTableComingFromColumn: QueueTableColumn = {
  headerI18nKey: 'queueComingFrom',
  CellComponent: QueueTableComingFromCell,
};
