import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type ConfigObject } from '../../config-schema';
import { type QueueEntry } from '../../types';

const QueueTableNameCell = ({ queueEntry }: { queueEntry: QueueEntry }) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.patient.uuid }}>
      {queueEntry.display}
    </ConfigurableLink>
  );
};

export default QueueTableNameCell;
