import React from 'react';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps, type QueueEntry } from '../../types';
import { formatDatetime } from '@openmrs/esm-framework';

export const queueTableVisitStartTimeColumn: QueueTableColumnFunction = (key, header) => {
  function getVisitStartTime(queueEntry: QueueEntry) {
    const startDatetime = queueEntry.visit?.startDatetime;
    return startDatetime ? formatDatetime(new Date(startDatetime)) : null;
  }

  const QueueTableVisitStartTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    return <span>{getVisitStartTime(queueEntry) ?? '--'}</span>;
  };

  return {
    key,
    header,
    CellComponent: QueueTableVisitStartTimeCell,
    getFilterableValue: getVisitStartTime,
  };
};
