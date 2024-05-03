import React from 'react';
import { type PatientIdentifierColumnConfig } from '../../config-schema';
import { type QueueEntry, type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const queueTablePatientIdentifierColumn: QueueTableColumnFunction = (
  key,
  header,
  config: PatientIdentifierColumnConfig,
) => {
  const { identifierType } = config;

  const getPatientIdentifier = (queueEntry: QueueEntry) => {
    for (const identifier of queueEntry.patient.identifiers) {
      if (identifier.identifierType?.uuid == identifierType) {
        return identifier.identifier;
      }
    }
    return null;
  };

  const QueueTablePatientIdentifierCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    return <span>{getPatientIdentifier(queueEntry)}</span>;
  };

  return {
    key,
    header,
    CellComponent: QueueTablePatientIdentifierCell,
    getFilterableValue: getPatientIdentifier,
  };
};
