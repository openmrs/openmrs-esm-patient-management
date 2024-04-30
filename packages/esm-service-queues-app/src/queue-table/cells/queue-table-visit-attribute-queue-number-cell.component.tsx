import React from 'react';
import { type VisitAttributeQueueNumberColumnConfig } from '../../config-schema';
import { type QueueTableColumnFunction, type QueueEntry, type QueueTableCellComponentProps } from '../../types';

export const queueTableVisitAttributeQueueNumberColumn: QueueTableColumnFunction = (
  key,
  header,
  config: VisitAttributeQueueNumberColumnConfig,
) => {
  const { visitQueueNumberAttributeUuid } = config;
  function getVisitQueueNumber(queueEntry: QueueEntry) {
    return queueEntry.visit?.attributes?.find((e) => e?.attributeType?.uuid === visitQueueNumberAttributeUuid)?.value;
  }

  const QueueTableVisitAttributeQueueNumberCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    return <span>{getVisitQueueNumber(queueEntry)}</span>;
  };

  return {
    key,
    header,
    CellComponent: QueueTableVisitAttributeQueueNumberCell,
    getFilterableValue: getVisitQueueNumber,
  };
};
