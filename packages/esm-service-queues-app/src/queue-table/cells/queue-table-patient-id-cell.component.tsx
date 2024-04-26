import React from 'react';
import { type PatientIdColumnConfig } from '../../config-schema';
import { type QueueEntry, type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const queueTablePatientIdColumn: QueueTableColumnFunction = (key, header, config: PatientIdColumnConfig) => {
  const { identifierType } = config;

  const getPatientId = (queueEntry: QueueEntry) => {
    for (const identifier of queueEntry.patient.identifiers) {
      if (identifier.identifierType?.uuid == identifierType) {
        return identifier.identifier;
      }
    }
    return null;
  };

  const QueueTablePatientIdCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    return <span>{getPatientId(queueEntry)}</span>;
  };

  return {
    key,
    header,
    CellComponent: QueueTablePatientIdCell,
    getFilterableValue: getPatientId,
  };
};
