import React, { useState } from 'react';
import { Tabs, Tab, Button } from 'carbon-components-react';
import styles from './appointment-list.scss';
import { useTranslation } from 'react-i18next';
import Calendar16 from '@carbon/icons-react/es/calendar/16';
import BookedAppointments from '../appoinments-tabs/booked-appointments.component';
import CompletedAppointments from '../appoinments-tabs/completed-appointments.component';
import CancelledAppointment from '../appoinments-tabs/cancelled-appointments.component';

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
        renderIcon={Calendar16}
        data-floating-menu-primary-focus
        iconDescription={t('viewCalendar', 'View Calendar')}>
        {t('viewCalendar', 'View Calendar')}
      </Button>

      <Tabs className={styles.tabs} type="container" selected={selectedTab} onSelectionChange={handleStatusChange}>
        <Tab defaultChecked label={t('bookedForToday', 'Booked for today')}>
          {selectedTab === 0 && <BookedAppointments status={selectedStatus} />}
        </Tab>
        <Tab label={t('cancelled', 'Cancelled')}>
          {selectedTab === 1 && <CancelledAppointment status={selectedStatus} />}
        </Tab>
        <Tab label={t('completed', 'Completed')}>
          {selectedTab === 2 && <CompletedAppointments status={selectedStatus} />}
        </Tab>
      </Tabs>
    </div>
  );
};

export default AppointmentList;
