import { ConfigurableLink, translateFrom, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type ConfigObject } from '../../config-schema';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';

export const QueueTableNameCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.patient.uuid }}>
      {queueEntry.patient.person.display}
    </ConfigurableLink>
  );
};

export const queueTableNameColumn: QueueTableColumn = {
  header: translateFrom('@openmrs/esm-service-queues-app', 'name', 'Name'),
  CellComponent: QueueTableNameCell,
  getFilterableValue: (queueEntry) => queueEntry.patient.person.display,
};
