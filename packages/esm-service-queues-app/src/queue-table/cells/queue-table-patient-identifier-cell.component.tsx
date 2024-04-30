import React from 'react';
import { type PatientIdentifierColumnConfig } from '../../config-schema';
import { type QueueEntry, type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const queueTablePatientIdentifierColumn: QueueTableColumnFunction = (
  key,
  header,
  config: PatientIdentifierColumnConfig,
) => {
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
