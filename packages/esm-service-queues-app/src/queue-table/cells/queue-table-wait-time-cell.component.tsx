import React from 'react';
import dayjs from 'dayjs';
import { useConfig } from '@openmrs/esm-framework';
import QueueDuration from '../components/queue-duration.component';
import { type ConfigObject } from '../../config-schema';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { waitTimeThresholds } = useConfig<ConfigObject>();
  const startedAt = dayjs(queueEntry.startedAt).toDate();
  const endedAt = queueEntry.endedAt ? dayjs(queueEntry.endedAt).toDate() : null;
  return <QueueDuration startedAt={startedAt} endedAt={endedAt} thresholds={waitTimeThresholds} />;
};

export const queueTableWaitTimeColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
});
