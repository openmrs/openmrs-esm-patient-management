import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import QueueDuration from '../../queue-entry-table-components/queue-duration.component';
import dayjs from 'dayjs';
import { translateFrom } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const startedAt = dayjs(queueEntry.startedAt).toDate();
  const endedAt = queueEntry.endedAt ? dayjs(queueEntry.endedAt).toDate() : null;
  return <QueueDuration startedAt={startedAt} endedAt={endedAt} />;
};

export const queueTableWaitTimeColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('waitTime', 'Name');
  },
  key: 'waitTime',
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
};
