import React from 'react';
import ActiveVisitsTable from './active-visits/active-visits-table.component';
import ActiveVisitsTabs from './active-visits/active-visits-tab.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import { ConfigObject, useConfig } from '@openmrs/esm-framework';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import QueueScreen from './queue-screen/queue-screen.component';

interface HomeProps {}

const Home: React.FC<HomeProps> = (props) => {
  const config = useConfig() as ConfigObject;
  const useQueueTableTabs = config.showQueueTableTab;
  const pathName = window.location.pathname;
  const activeTicketScreen = pathName.substring(pathName.lastIndexOf('/') + 1);

  if (activeTicketScreen === 'screen') {
    return <QueueScreen />;
  }
  return (
    <div>
      <PatientQueueHeader />
      <ClinicMetrics />
      {useQueueTableTabs === true ? <ActiveVisitsTabs /> : <ActiveVisitsTable />}
    </div>
  );
};

export default Home;
