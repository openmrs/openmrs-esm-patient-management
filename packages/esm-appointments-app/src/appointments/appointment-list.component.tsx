import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import { Calendar } from '@carbon/react/icons';
import BookedAppointments from '../appointments-tabs/booked-appointments.component';
import CompletedAppointments from '../appointments-tabs/completed-appointments.component';
import CancelledAppointment from '../appointments-tabs/cancelled-appointments.component';
import styles from './appointment-list.scss';

enum AppointmentTypes {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

const AppointmentList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(AppointmentTypes.SCHEDULED);
  const handleStatusChange = (index: number) => {
    switch (index) {
      case 0:
        setSelectedStatus(AppointmentTypes.SCHEDULED);
        setSelectedTab(0);
        break;
      case 1:
        setSelectedStatus(AppointmentTypes.CANCELLED);
        setSelectedTab(1);
        break;
      case 2:
        setSelectedStatus(AppointmentTypes.COMPLETED);
        setSelectedTab(2);
        break;
    }
  };
  return (
    <div className={styles.appointmentList}>
      <Button
        className={styles.calendarButton}
        kind="primary"
        renderIcon={(props) => <Calendar size={16} {...props} />}
        data-floating-menu-primary-focus
        iconDescription={t('viewCalendar', 'View Calendar')}>
        {t('viewCalendar', 'View Calendar')}
      </Button>

      <Tabs className={styles.tabs}>
        <TabList aria-label="Appointment tabs" contained>
          <Tab>{t('bookedForToday', 'Booked for today')}</Tab>
          <Tab>{t('cancelled', 'Cancelled')}</Tab>
          <Tab>{t('completed', 'Completed')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <BookedAppointments status={selectedStatus} />
          </TabPanel>
          <TabPanel>
            <CancelledAppointment status={selectedStatus} />
          </TabPanel>
          <TabPanel>{<CompletedAppointments status={selectedStatus} />}</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default AppointmentList;
