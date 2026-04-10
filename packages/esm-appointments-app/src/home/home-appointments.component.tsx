import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { toOmrsIsoString } from '@openmrs/esm-framework';
import AppointmentsTable from '../appointments/common-components/appointments-table.component';
import { useAppointmentList } from '../hooks/useAppointmentList';
import styles from './home-appointments.scss';
import { AppointmentStatus } from '../types';

/**
 * A extension that shows today's appointments, originally meant for the home app.
 */
const HomeAppointments = () => {
  const { t } = useTranslation();

  const today = toOmrsIsoString(dayjs().startOf('day').toDate());
  const { appointmentList, isLoading } = useAppointmentList(today);

  const excludeCancelledAppointments = appointmentList.filter(
    (appointment) => appointment.status !== AppointmentStatus.CANCELLED,
  );

  return (
    <div className={styles.container}>
      <AppointmentsTable
        appointments={excludeCancelledAppointments}
        isLoading={isLoading}
        tableHeading={t('todaysAppointment', "Today's Appointments")}
      />
    </div>
  );
};

export default HomeAppointments;
