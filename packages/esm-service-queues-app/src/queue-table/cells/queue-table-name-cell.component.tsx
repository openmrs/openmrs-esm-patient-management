import React from 'react';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type QueueTableCellComponentProps, type QueueTableColumn } from '../../types';

export const QueueTableNameCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.patient.uuid }}>
      {queueEntry.patient.person.display}
    </ConfigurableLink>
  );
};

export const queueTableNameColumn: QueueTableColumn = (t) => ({
  header: t('name', 'Name'),
  CellComponent: QueueTableNameCell,
  getFilterableValue: (queueEntry) => queueEntry.patient.person.display,
});
