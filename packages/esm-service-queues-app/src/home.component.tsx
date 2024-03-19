import React, { useState } from 'react';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';
import Joyride from 'react-joyride';
import ActiveVisitsTable from './active-visits/active-visits-table.component';
import ActiveVisitsTabs from './active-visits/active-visits-tab.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';

const Home: React.FC = () => {
  const config = useConfig<ConfigObject>();
  const useQueueTableTabs: boolean = config.showQueueTableTab;

  const [{ run, steps }, setJoyrideState] = useState({
    run: true,
    steps: [
      {
        content: <h2>Welcome to Service and Queues!</h2>,
        locale: { skip: <strong>SKIP</strong> },
        placement: 'center' as const,
        target: 'body',
      },
      {
        content: <h2>Explore the Patient Queue Header</h2>,
        placement: 'auto' as const,
        target: '.patient-queue-head',
        title: 'Patient Queue Header',
      },
      {
        content: <h2>Check out the Clinic Metrics</h2>,
        placement: 'auto' as const,
        target: '.clinic-metric',
        title: 'Clinic Metrics',
      },

      // Add more steps as needed...
    ],
  });

  return (
    <>
      <PatientQueueHeader />
      <ClinicMetrics />
      {useQueueTableTabs ? <ActiveVisitsTabs /> : <ActiveVisitsTable />}
      <Joyride
        continuous={true}
        callback={() => {}}
        run={run}
        steps={steps}
        hideCloseButton
        scrollToFirstStep
        showSkipButton
        showProgress={true}
        styles={{
          buttonNext: {
            backgroundColor: 'green',
          },
          buttonBack: {
            color: 'blue',
          },
        }}
      />
    </>
  );
};

export default Home;
