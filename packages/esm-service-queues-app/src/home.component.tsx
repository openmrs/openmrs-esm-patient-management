import React from 'react';
import { useConfig, useFeatureFlag } from '@openmrs/esm-framework';
import ActiveVisitsTabs from './active-visits/active-visits-tab.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import { type ConfigObject } from './config-schema';
import DefaultQueueTable from './queue-table/default-queue-table.component';

const Home: React.FC = () => {
  const { showQueueTableTab } = useConfig<ConfigObject>();

  return (
    <>
      <PatientQueueHeader />
      <ClinicMetrics />
      {showQueueTableTab ? <ActiveVisitsTabs /> : <DefaultQueueTable />}
    </>
  );
};

export default Home;
