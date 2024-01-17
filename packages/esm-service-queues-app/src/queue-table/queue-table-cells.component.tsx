import React from 'react';
import { type VisitQueueEntry } from '../active-visits/active-visits-table.resource';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';

export const QueueTableName = ({ queueEntry }: { queueEntry: VisitQueueEntry }) => {
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  return (
    <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: queueEntry.queueEntry.patient.uuid }}>
      {queueEntry.queueEntry.display}
    </ConfigurableLink>
  );
};

export const QueueTablePriority = ({ queueEntry }: { queueEntry: VisitQueueEntry }) => {
  return <>{queueEntry.queueEntry.priority.display}</>;
};

export const QueueTableStatus = ({ queueEntry }: { queueEntry: VisitQueueEntry }) => {
  return <>{queueEntry.queueEntry.status.display}</>;
};
