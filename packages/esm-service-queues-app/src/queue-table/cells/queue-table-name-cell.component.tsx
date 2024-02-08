import React from 'react';
import { type VisitQueueEntry } from '../../active-visits/active-visits-table.resource';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';

const QueueTableNameCell = ({ queueEntry }: { queueEntry: VisitQueueEntry }) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.queueEntry.patient.uuid }}>
      {queueEntry.queueEntry.display}
    </ConfigurableLink>
  );
};

export default QueueTableNameCell;
