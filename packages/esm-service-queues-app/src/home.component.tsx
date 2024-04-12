import React from 'react';
import { useConfig, useFeatureFlag } from '@openmrs/esm-framework';
import ActiveVisitsTable from './active-visits/active-visits-table.component';
import ActiveVisitsTabs from './active-visits/active-visits-tab.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import { type ConfigObject } from './config-schema';
import DefaultQueueTable from './queue-table/default-queue-table.component';

const Home: React.FC = () => {
  const { showQueueTableTab, useActiveVisitsTable } = useConfig<ConfigObject>();
  const useActiveVisitsTableViaFeatureFlag = useFeatureFlag('active-visits-table');

  return (
    <>
      <PatientQueueHeader />
      <ClinicMetrics />
      {showQueueTableTab ? (
        <ActiveVisitsTabs />
      ) : useActiveVisitsTable || useActiveVisitsTableViaFeatureFlag ? (
        <ActiveVisitsTable />
      ) : (
        <DefaultQueueTable />
      )}
    </>
  );
};

export default Home;
