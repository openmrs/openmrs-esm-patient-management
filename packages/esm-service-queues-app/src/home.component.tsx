import React, { useState } from 'react';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig, userHasAccess, useSession } from '@openmrs/esm-framework';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import QueueLocationHeaderTitle from './patient-queue-header/queue-location-header-title.component';
import ClinicMetrics from './metrics/metrics-container.component';
import ClinicOverview from './clinic-administrator/clinic-overview.component';
import AttendingPatients from './attending-patients/attending-patients.component';
import DefaultQueueTable from './queue-table/default-queue-table.component';
import { type ConfigObject } from './config-schema';
import styles from './home.scss';

const clinicOverviewTabIndex = 0;

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { clinicAdministratorScreen } = useConfig<ConfigObject>();
  const session = useSession();
  const [selectedTabIndex, setSelectedTabIndex] = useState(clinicOverviewTabIndex);

  // Until the session resolves, fall back to the standard dashboard rather than to nothing: the tab
  // strip appearing a moment late is a far smaller cost than a blank Service Queues page.
  const showClinicOverview =
    clinicAdministratorScreen.enabled &&
    Boolean(session?.user) &&
    userHasAccess(clinicAdministratorScreen.privilege, session.user);

  if (!showClinicOverview) {
    return (
      <>
        <PatientQueueHeader title={<QueueLocationHeaderTitle />} actions={<ClinicMetrics />} />
        <WaitingListView />
      </>
    );
  }

  // The overview tab carries its own clinic totals, so the header's metrics would duplicate them.
  return (
    <>
      <PatientQueueHeader
        title={<QueueLocationHeaderTitle />}
        actions={selectedTabIndex === clinicOverviewTabIndex ? undefined : <ClinicMetrics />}
      />
      <Tabs selectedIndex={selectedTabIndex} onChange={({ selectedIndex }) => setSelectedTabIndex(selectedIndex)}>
        <TabList aria-label={t('serviceQueueViews', 'Service queue views')} className={styles.tabList} contained>
          <Tab className={styles.tab}>{t('clinicOverview', 'Clinic overview')}</Tab>
          <Tab className={styles.tab}>{t('waitingList', 'Waiting list')}</Tab>
        </TabList>
        {/* Carbon keeps hidden panels mounted, so each panel is gated on being the selected one:
            otherwise the tab nobody is looking at keeps polling for queue entries. */}
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            {selectedTabIndex === clinicOverviewTabIndex && <ClinicOverview />}
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            {selectedTabIndex !== clinicOverviewTabIndex && <WaitingListView />}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

function WaitingListView() {
  return (
    <>
      <AttendingPatients />
      <DefaultQueueTable />
    </>
  );
}

export default Home;
