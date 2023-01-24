import React from 'react';
import ActiveVisitsTable from './active-visits/active-visits-table.component';
import ActiveVisitsTabs from './active-visits/active-visits-tab.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import { ConfigObject, useConfig } from '@openmrs/esm-framework';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const config = useConfig() as ConfigObject;
  const useQueueTableTabs = config.showQueueTableTab;

  return (
    <div>
      <ClinicMetrics />
      {useQueueTableTabs === true ? <ActiveVisitsTabs /> : <ActiveVisitsTable />}
    </div>
  );
};

export default Home;
