import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import { Download } from '@carbon/react/icons';
import ScheduledAppointments from '../appointments-tabs/scheduled-appointments.component';
import UnscheduledAppointments from '../appointments-tabs/unscheduled-appointments.component';
import { useAppointments } from '../appointments-tabs/appointments-table.resource';
import { useVisits } from '../hooks/useVisits';
import styles from './appointment-list.scss';

const AppointmentList: React.FC<{ appointmentServiceType: string }> = ({ appointmentServiceType }) => {
  const { t } = useTranslation();
  const { appointments } = useAppointments();
  const [selectedTab, setSelectedTab] = useState(0);
  const { isLoading, visits } = useVisits();
  return (
    <div className={styles.appointmentList}>
      <div className={styles.downloadButton}>
        {appointments.length > 0 && (
          <Button renderIcon={Download} kind="ghost">
            {t('downloadAppointmentList', 'Download appointment list')}
          </Button>
        )}
      </div>
      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
          <Tab className={styles.tab}>{t('scheduled', 'Scheduled')}</Tab>
          <Tab className={styles.tab}>{t('unscheduled', 'Unscheduled')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel className={styles.tabPanel}>
            <ScheduledAppointments
              visits={visits}
              isLoading={isLoading}
              appointmentServiceType={appointmentServiceType}
            />
          </TabPanel>
          <TabPanel className={styles.tabPanel}>
            <UnscheduledAppointments />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default AppointmentList;
