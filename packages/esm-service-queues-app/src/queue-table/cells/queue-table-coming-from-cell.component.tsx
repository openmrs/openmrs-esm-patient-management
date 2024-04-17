import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import { translateFrom } from '@openmrs/esm-framework';

export const QueueTableComingFromCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queueComingFrom?.display}</>;
};

export const queueTableComingFromColumn: QueueTableColumn = {
  header: translateFrom('@openmrs/esm-service-queues-app', 'queueComingFrom', 'Coming From'),
  CellComponent: QueueTableComingFromCell,
  getFilterableValue: (queueEntry) => queueEntry.queueComingFrom?.display,
};
