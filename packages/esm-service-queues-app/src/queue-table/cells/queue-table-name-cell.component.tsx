import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type ConfigObject } from '../../config-schema';
import { type QueueTableCellComponentProps } from '../../types';

const QueueTableNameCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.patient.uuid }}>
      {queueEntry.patient.person.display}
    </ConfigurableLink>
  );
};

export default QueueTableNameCell;
