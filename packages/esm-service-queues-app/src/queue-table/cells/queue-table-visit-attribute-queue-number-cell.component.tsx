import { useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ConfigObject } from '../../config-schema';
import { type QueueEntry, type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableVisitAttributeQueueNumberCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { visitQueueNumberAttributeUuid } = useConfig<ConfigObject>();

  const visitQueueNumber = getVisitQueueNumber(queueEntry, visitQueueNumberAttributeUuid);
  return <span>{visitQueueNumber}</span>;
};

export const queueTableVisitAttributeQueueNumberColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('queueNumber', 'Queue number');
  },
  key: 'queueNumber',
  CellComponent: QueueTableVisitAttributeQueueNumberCell,
  getFilterableValue: (queueEntry, conceptsConfig) =>
    getVisitQueueNumber(queueEntry, conceptsConfig?.visitQueueNumberAttributeUuid),
};

function getVisitQueueNumber(queueEntry: QueueEntry, visitQueueNumberAttributeUuid: string) {
  return queueEntry.visit?.attributes?.find((e) => e?.attributeType?.uuid === visitQueueNumberAttributeUuid)?.value;
}
