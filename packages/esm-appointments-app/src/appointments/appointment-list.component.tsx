import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import { Calendar } from '@carbon/react/icons';
import CompletedAppointments from '../appointments-tabs/completed-appointments.component';
import CancelledAppointment from '../appointments-tabs/cancelled-appointments.component';
import styles from './appointment-list.scss';
import { navigate } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';
import ScheduledAppointments from '../appointments-tabs/schedule-appointment.component';
import CheckInAppointments from '../appointments-tabs/checkedinappointments.component';
import { useAppointmentDate } from '../helpers';
import dayjs from 'dayjs';

enum AppointmentTypes {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  CHECKEDIN = 'CheckedIn',
}

const AppointmentList: React.FC = () => {
  const { t } = useTranslation();
  const startDate = useAppointmentDate();
  const isToday = dayjs(new Date(startDate)).isSame(new Date(), 'date');
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div className={styles.appointmentList}>
      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
          <Tab>{t('scheduled', 'Scheduled')}</Tab>
          <Tab>{t('cancelled', 'Cancelled')}</Tab>
          <Tab>{t('completed', 'Completed')}</Tab>
          <Tab disabled={!isToday}>{t('checkedIn', 'CheckedIn')}</Tab>
          <Button
            className={styles.calendarButton}
            kind="primary"
            onClick={() => navigate({ to: `${spaBasePath}/calendar` })}
            renderIcon={(props) => <Calendar size={16} {...props} />}
            data-floating-menu-primary-focus
            iconDescription={t('viewCalendar', 'View Calendar')}>
            {t('viewCalendar', 'View Calendar')}
          </Button>
        </TabList>
        <TabPanels>
          <TabPanel style={{ padding: 0 }}>
            <ScheduledAppointments status={AppointmentTypes.SCHEDULED} />
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>
            <CancelledAppointment status={AppointmentTypes.CANCELLED} />
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>{<CompletedAppointments status={AppointmentTypes.COMPLETED} />}</TabPanel>
          {isToday && (
            <TabPanel style={{ padding: 0 }}>{<CheckInAppointments status={AppointmentTypes.CHECKEDIN} />}</TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default AppointmentList;
