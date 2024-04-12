import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type ConfigObject } from '../../config-schema';
import { type QueueTableColumn, type QueueTableCellComponentProps, type QueueEntry } from '../../types';

export const QueueTableVisitAttributeQueueNumberCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ConfigObject>();

  const visitQueueNumber = getVisitQueueNumber(queueEntry, visitQueueNumberAttributeUuid);
  return <span>{visitQueueNumber}</span>;
};

export const queueTableVisitAttributeQueueNumberColumn: QueueTableColumn = {
  headerI18nKey: 'queueNumber',
  CellComponent: QueueTableVisitAttributeQueueNumberCell,
  getFilterableValue: (queueEntry, conceptsConfig) =>
    getVisitQueueNumber(queueEntry, conceptsConfig?.visitQueueNumberAttributeUuid),
};

function getVisitQueueNumber(queueEntry: QueueEntry, visitQueueNumberAttributeUuid: string) {
  return queueEntry.visit?.attributes?.find((e) => e?.attributeType?.uuid === visitQueueNumberAttributeUuid)?.value;
}
