import React from 'react';
import dayjs from 'dayjs';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const QueueTableWaitTimeCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const birthdate = dayjs(queueEntry.patient.person.birthdate);
  const todaydate = dayjs();
  const age = todaydate.diff(birthdate, 'years');

  return <span>{age}</span>;
};

export const queueTablePatientAgeColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableWaitTimeCell,
  getFilterableValue: null,
});
