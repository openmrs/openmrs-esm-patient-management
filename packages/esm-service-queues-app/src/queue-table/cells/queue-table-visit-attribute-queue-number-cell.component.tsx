import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type QueueEntry, type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableVisitAttributeQueueNumberCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ConfigObject>();

  const visitQueueNumber = getVisitQueueNumber(queueEntry, visitQueueNumberAttributeUuid);
  return <span>{visitQueueNumber}</span>;
};

export const queueTableVisitAttributeQueueNumberColumn: QueueTableColumn = (t) => ({
  header: t('queueNumber', 'Queue number'),
  CellComponent: QueueTableVisitAttributeQueueNumberCell,
  getFilterableValue: (queueEntry, conceptsConfig) =>
    getVisitQueueNumber(queueEntry, conceptsConfig?.visitQueueNumberAttributeUuid),
});

function getVisitQueueNumber(queueEntry: QueueEntry, visitQueueNumberAttributeUuid: string) {
  return queueEntry.visit?.attributes?.find((e) => e?.attributeType?.uuid === visitQueueNumberAttributeUuid)?.value;
}
