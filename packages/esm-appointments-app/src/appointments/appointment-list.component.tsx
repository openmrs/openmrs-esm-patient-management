import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tab, TabList, Tabs, TabPanel, TabPanels } from '@carbon/react';
import { Calendar, Download } from '@carbon/react/icons';
import CompletedAppointments from '../appointments-tabs/completed-appointments.component';
import styles from './appointment-list.scss';
import { formatDate, navigate } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';
import ScheduledAppointments from '../appointments-tabs/schedule-appointment.component';
import CheckInAppointments from '../appointments-tabs/checkedinappointments.component';
import { useAppointmentDate } from '../helpers';
import dayjs from 'dayjs';
import UnScheduledAppointments from '../appointments-tabs/unscheduled-appointments.component';
import PendingAppointments from '../appointments-tabs/pending-appointments.component';
import { useAppointments } from '../appointments-tabs/appointments-table.resource';
import MissedAppointments from '../appointments-tabs/missed-appointment.component';

enum AppointmentTypes {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  CHECKEDIN = 'CheckedIn',
  MISSED = 'Missed',
}

const AppointmentList: React.FC = () => {
  const { t } = useTranslation();
  const startDate = useAppointmentDate();
  const { appointments } = useAppointments();
  const isToday = dayjs(new Date(startDate)).isSame(new Date(), 'date');
  const [selectedTab, setSelectedTab] = useState(0);

  const appointmentDownloadInfo = () => {
    const downloadInfo: any = appointments
      ?.map((appointment) => ({
        patientName: appointment.name,
        phoneNumber: appointment.phoneNumber ?? '--',
      }))
      .map(function (appointment) {
        return JSON.stringify(Object.values(appointment));
      })
      .join('\n')
      .replace(/(^\[)|(\]$)/gm, '');
    return new Blob([downloadInfo], {
      type: 'text/csv;charset=utf-8;',
    });
  };
  return (
    <div className={styles.appointmentList}>
      <div className={styles.downloadButton}>
        {appointments.length > 0 && (
          <Button renderIcon={Download} kind="tertiary">
            <a
              className={styles.downloadLink}
              download={`Appointments ${startDate}.csv`}
              href={window.URL.createObjectURL(appointmentDownloadInfo())}>
              {t('downloadAppointmentList', 'Download appointment list')}
            </a>
          </Button>
        )}
      </div>
      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
          <Tab>{t('scheduled', 'Scheduled')}</Tab>
          <Tab>{t('unScheduled', 'UnScheduled')}</Tab>
          <Tab>{t('completed', 'Completed')}</Tab>
          <Tab disabled={!isToday}>{t('checkedIn', 'CheckedIn')}</Tab>
          <Tab>{t('missed', 'Missed')}</Tab>
          <Tab>{t('pending', 'Pending')}</Tab>
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
            <UnScheduledAppointments />
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>{<CompletedAppointments status={AppointmentTypes.COMPLETED} />}</TabPanel>
          {isToday && (
            <TabPanel style={{ padding: 0 }}>{<CheckInAppointments status={AppointmentTypes.CHECKEDIN} />}</TabPanel>
          )}
          <TabPanel style={{ padding: 0 }}>{<MissedAppointments status={AppointmentTypes.MISSED} />}</TabPanel>
          <TabPanel style={{ padding: 0 }}>
            <PendingAppointments />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default AppointmentList;
