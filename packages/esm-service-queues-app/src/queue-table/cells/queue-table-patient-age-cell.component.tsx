import React from 'react';
import { age } from '@openmrs/esm-framework';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const QueueTablePatientAgeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const birthdate = queueEntry.patient.person?.birthdate;

  return <span>{birthdate ? age(birthdate) : null}</span>;
};

export const queueTablePatientAgeColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTablePatientAgeCell,
  getFilterableValue: null,
});
