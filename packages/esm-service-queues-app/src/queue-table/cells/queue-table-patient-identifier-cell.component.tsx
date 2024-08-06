import React from 'react';
import { type PatientIdentifierColumnConfig } from '../../config-schema';
import { type QueueEntry, type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const queueTablePatientIdentifierColumn: QueueTableColumnFunction = (
  key,
  header,
  config: PatientIdentifierColumnConfig,
) => {
  const { identifierTypeUuid } = config;

  const getPatientIdentifier = (queueEntry: QueueEntry) =>
    queueEntry.patient.identifiers.find((i) => i.identifierType?.uuid == identifierTypeUuid)?.identifier;

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
