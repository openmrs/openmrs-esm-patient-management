import React from 'react';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const QueueTableNameCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.patient.uuid }}>
      {queueEntry.patient.person.display}
    </ConfigurableLink>
  );
};

export const queueTableNameColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableNameCell,
  getFilterableValue: (queueEntry) => queueEntry.patient.person.display,
});
