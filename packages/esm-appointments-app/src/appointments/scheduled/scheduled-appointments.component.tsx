import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { formatDate, parseDate, useDefineAppContext } from '@openmrs/esm-framework';
import { useAppointmentsStore } from '../../store';
import { type AppointmentsAppContext } from '../../types';
import { useAppointmentList } from '../../hooks/useAppointmentList';
import AppointmentsTable from '../common-components/appointments-table.component';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from './scheduled-appointments.scss';

dayjs.extend(isSameOrBefore);

const ScheduledAppointments: React.FC<{}> = () => {
  const { t } = useTranslation();
  const { appointmentServiceTypes } = useAppointmentsStore();
  const selectedDate = useSelectedDate();

  const { appointmentList: appointmentsForSelectedDate, isLoading, error } = useAppointmentList(selectedDate);

  const appointmentForSelectedDateFilteredByServiceTypes =
    appointmentServiceTypes.length > 0
      ? appointmentsForSelectedDate.filter(({ service }) => appointmentServiceTypes.includes(service.uuid))
      : appointmentsForSelectedDate;

  useDefineAppContext<AppointmentsAppContext>('appointments', {
    appointmentForSelectedDateFilteredByServiceTypes,
    isLoading,
    error,
  });
  const formattedDate = formatDate(parseDate(selectedDate), { mode: 'standard', time: false });

  return (
    <div className={styles.container}>
      <AppointmentsTable
        appointments={appointmentForSelectedDateFilteredByServiceTypes}
        isLoading={isLoading}
        tableHeading={t('appointmentsForDate', 'Appointments for: {{date}}', { date: formattedDate })}
      />
    </div>
  );
};

export default ScheduledAppointments;
