import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';

import { useVisits } from '../hooks/useVisits';
import ScheduledAppointments from './scheduled/scheduled-appointments.component';
import UnscheduledAppointments from './unscheduled/unscheduled-appointments.component';
import styles from './appointment-tabs.scss';

interface AppointmentTabsProps {
  appointmentServiceType: string;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({ appointmentServiceType }) => {
  const { t } = useTranslation();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const { isLoading = false, visits = [], mutateVisit } = useVisits();

  const handleTabChange = ({ selectedIndex }: { selectedIndex: number }) => {
    setActiveTabIndex(selectedIndex);
  };

  return (
    <div className={styles.appointmentList}>
      <Tabs selectedIndex={activeTabIndex} onChange={handleTabChange} className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
          <Tab className={styles.tab}>{t('scheduled', 'Scheduled')}</Tab>
          <Tab className={styles.tab}>{t('unscheduled', 'Unscheduled')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <ScheduledAppointments {...{ visits, isLoading, appointmentServiceType, mutateVisit }} />
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <UnscheduledAppointments />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default AppointmentTabs;
