import React from 'react';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';
import ActiveVisitsTable from './active-visits/active-visits-table.component';
import ActiveVisitsTabs from './active-visits/active-visits-tab.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';

const Home: React.FC = () => {
  const config = useConfig<ConfigObject>();
  const useQueueTableTabs: boolean = config.showQueueTableTab;

  return (
    <>
      <PatientQueueHeader />
      <ClinicMetrics />
      {useQueueTableTabs ? <ActiveVisitsTabs /> : <ActiveVisitsTable />}
    </>
  );
};

export default Home;
