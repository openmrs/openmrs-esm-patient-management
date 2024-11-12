import React from 'react';
import { type VisitAttributeQueueNumberColumnConfig } from '../../config-schema';
import { type QueueTableColumnFunction, type QueueEntry } from '../../types';

export const queueTableVisitAttributeQueueNumberColumn: QueueTableColumnFunction = (
  key,
  header,
  { visitQueueNumberAttributeUuid }: VisitAttributeQueueNumberColumnConfig,
) => {
  if (!visitQueueNumberAttributeUuid) {
    console.error(
      'No visit queue number attribute is configured, but the queue is configured to display the queue number.',
    );
    return null;
  }

  function getVisitQueueNumber(queueEntry: QueueEntry) {
    return queueEntry.visit?.attributes?.find((e) => e?.attributeType?.uuid === visitQueueNumberAttributeUuid)?.value;
  }

  const QueueTableVisitAttributeQueueNumberCell = ({ queueEntry }: { queueEntry: QueueEntry }) => {
    return <span>{getVisitQueueNumber(queueEntry)}</span>;
  };

  return {
    key,
    header,
    CellComponent: QueueTableVisitAttributeQueueNumberCell,
    getFilterableValue: getVisitQueueNumber,
  };
};
