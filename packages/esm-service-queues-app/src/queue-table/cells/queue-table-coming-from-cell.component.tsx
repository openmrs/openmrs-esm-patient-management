import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableComingFromCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queueComingFrom?.display}</>;
};

export const queueTableComingFromColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('queueComingFrom', 'Coming from');
  },
  key: 'queueComingFrom',
  CellComponent: QueueTableComingFromCell,
  getFilterableValue: (queueEntry) => queueEntry.queueComingFrom?.display,
};
