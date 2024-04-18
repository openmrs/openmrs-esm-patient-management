import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import { translateFrom } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

export const QueueTableComingFromCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.queueComingFrom?.display}</>;
};

export const queueTableComingFromColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('queueComingFrom', 'Coming From');
  },
  key: 'queueComingFrom',
  CellComponent: QueueTableComingFromCell,
  getFilterableValue: (queueEntry) => queueEntry.queueComingFrom?.display,
};
