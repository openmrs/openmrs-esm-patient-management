import { ConfigurableLink, translateFrom, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type ConfigObject } from '../../config-schema';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';
import { useTranslation } from 'react-i18next';

export const QueueTableNameCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.patient.uuid }}>
      {queueEntry.patient.person.display}
    </ConfigurableLink>
  );
};

export const queueTableNameColumn: QueueTableColumn = {
  HeaderComponent: () => {
    const { t } = useTranslation();
    return t('name', 'Name');
  },
  key: 'name',
  CellComponent: QueueTableNameCell,
  getFilterableValue: (queueEntry) => queueEntry.patient.person.display,
};
