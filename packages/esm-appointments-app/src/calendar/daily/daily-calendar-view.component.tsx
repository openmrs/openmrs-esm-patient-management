import { DataTableSkeleton, InlineNotification, Tag } from '@carbon/react';
import { formatTime, parseDate } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { omrsDateFormat } from '../../constants';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import { useAppointmentsStore } from '../../store';
import { type Appointment } from '../../types';
import calendarStyles from '../appointments-calendar-view-view.scss';
import styles from './daily-calendar-view.scss';
import DailyHeader from './daily-header.component';

// Maps appointment status to a Carbon tag type so it's colour-coded
const statusTagType = (status: string) => {
  switch (status) {
    case 'CheckedIn':
      return 'green';
    case 'Scheduled':
      return 'blue';
    case 'Cancelled':
      return 'red';
    case 'Missed':
      return 'warm-gray';
    case 'Completed':
      return 'teal';
    default:
      return 'gray';
  }
};

interface AppointmentRowProps {
  appointment: Appointment;
}

// One row in the list — patient name, time, service, status
const AppointmentRow: React.FC<AppointmentRowProps> = ({ appointment }) => {
  const { t } = useTranslation();
  const startTime = formatTime(parseDate(appointment.startDateTime));
  const endTime = appointment.endDateTime ? formatTime(parseDate(appointment.endDateTime)) : null;

  return (
    <div className={styles.appointmentRow}>
      <div className={styles.timeColumn}>
        <span className={styles.startTime}>{startTime}</span>
        {endTime && <span className={styles.endTime}>{endTime}</span>}
      </div>
      <div className={styles.detailsColumn}>
        <span className={styles.patientName}>{appointment.patient?.name}</span>
        <span className={styles.serviceLabel}>{appointment.service?.name}</span>
        {appointment.providers?.length > 0 && (
          <span className={styles.providerLabel}>{appointment.providers[0]?.display}</span>
        )}
      </div>
      <div className={styles.statusColumn}>
        <Tag type={statusTagType(appointment.status)} size="sm">
          {t(appointment.status, appointment.status)}
        </Tag>
      </div>
    </div>
  );
};

const DailyCalendarView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();

  const formattedDate = dayjs(selectedDate).startOf('day').format(omrsDateFormat);

  // Fetch all statuses we want to display in one day
  const { appointmentList: scheduledList, isLoading: loadingScheduled } = useAppointmentList(
    'Scheduled',
    formattedDate,
  );
  const { appointmentList: checkedInList, isLoading: loadingCheckedIn } = useAppointmentList(
    'CheckedIn',
    formattedDate,
  );
  const { appointmentList: cancelledList, isLoading: loadingCancelled } = useAppointmentList(
    'Cancelled',
    formattedDate,
  );
  const { appointmentList: missedList, isLoading: loadingMissed } = useAppointmentList('Missed', formattedDate);

  const isLoading = loadingScheduled || loadingCheckedIn || loadingCancelled || loadingMissed;

  // Combine everything, then sort by start time so the list reads top-to-bottom chronologically
  const allAppointments = [...scheduledList, ...checkedInList, ...cancelledList, ...missedList].sort((a, b) => {
    return dayjs(a.startDateTime).diff(dayjs(b.startDateTime));
  });

  if (isLoading) {
    return (
      <div className={calendarStyles.calendarViewContainer}>
        <DailyHeader />
        <DataTableSkeleton role="progressbar" zebra columnCount={3} rowCount={5} />
      </div>
    );
  }

  return (
    <div className={calendarStyles.calendarViewContainer}>
      <DailyHeader />

      <div className={styles.container}>
        {/* Summary bar — total count for the day */}
        <div className={styles.summaryBar}>
          <span className={styles.totalCount}>
            {t('totalAppointmentsCount', '{{count}} appointments', { count: allAppointments.length })}
          </span>
          <span className={styles.dateSubtitle}>{dayjs(selectedDate).format('dddd, D MMMM YYYY')}</span>
        </div>

        {allAppointments.length === 0 ? (
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title={t('noAppointmentsForDay', 'No appointments scheduled for this day')}
            className={styles.emptyNotice}
          />
        ) : (
          <div className={styles.appointmentsList}>
            {allAppointments.map((appointment) => (
              <AppointmentRow key={appointment.uuid} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCalendarView;
