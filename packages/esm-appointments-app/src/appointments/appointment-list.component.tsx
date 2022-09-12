import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import { Calendar } from '@carbon/react/icons';
import BookedAppointments from '../appointments-tabs/booked-appointments.component';
import CompletedAppointments from '../appointments-tabs/completed-appointments.component';
import CancelledAppointment from '../appointments-tabs/cancelled-appointments.component';
import styles from './appointment-list.scss';
import { navigate } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';

enum AppointmentTypes {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

const AppointmentList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div className={styles.appointmentList}>
      <Button
        className={styles.calendarButton}
        kind="primary"
        onClick={() => navigate({ to: `${spaBasePath}/calendar` })}
        renderIcon={(props) => <Calendar size={16} {...props} />}
        data-floating-menu-primary-focus
        iconDescription={t('viewCalendar', 'View Calendar')}>
        {t('viewCalendar', 'View Calendar')}
      </Button>

      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        className={styles.tabs}>
        <TabList aria-label="Appointment tabs" contained>
          <Tab>{t('bookedForToday', 'Booked for today')}</Tab>
          <Tab>{t('cancelled', 'Cancelled')}</Tab>
          <Tab>{t('completed', 'Completed')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel style={{ padding: 0 }}>
            <BookedAppointments status={AppointmentTypes.SCHEDULED} />
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>
            <CancelledAppointment status={AppointmentTypes.CANCELLED} />
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>{<CompletedAppointments status={AppointmentTypes.COMPLETED} />}</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default AppointmentList;
