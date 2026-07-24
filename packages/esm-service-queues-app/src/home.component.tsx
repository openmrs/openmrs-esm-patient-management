import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import QueueLocationHeaderTitle from './patient-queue-header/queue-location-header-title.component';
import ClinicMetrics from './metrics/metrics-container.component';
import AttendingPatients from './attending-patients/attending-patients.component';
import DefaultQueueTable from './queue-table/default-queue-table.component';
import ExpectedAppointments from './expected-appointments/expected-appointments.component';
import { useQueueEntries } from './hooks/useQueueEntries';
import { useServiceQueuesStore } from './store/store';
import { type ConfigObject } from './config-schema';
import styles from './home.scss';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const {
    concepts: { defaultStatusConceptUuid },
  } = useConfig<ConfigObject>();
  const { totalCount } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    status: defaultStatusConceptUuid,
    isEnded: false,
  });
  const waitingListLabel = isNaN(totalCount)
    ? t('waitingList', 'Waiting list')
    : `${t('waitingList', 'Waiting list')} (${totalCount})`;

  return (
    <>
      <PatientQueueHeader title={<QueueLocationHeaderTitle />} actions={<ClinicMetrics />} />
      <AttendingPatients />
      <div className={styles.tabsContainer}>
        <Tabs>
          <TabList aria-label={t('queueViews', 'Queue views')} contained>
            <Tab>{waitingListLabel}</Tab>
            <Tab>{t('expectedAppointments', 'Expected appointments')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <DefaultQueueTable />
            </TabPanel>
            <TabPanel>
              <ExpectedAppointments />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </>
  );
};

export default Home;
