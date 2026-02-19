import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { toOmrsIsoString } from '@openmrs/esm-framework';
import AppointmentsList from '../appointments/scheduled/appointments-list.component';
import styles from './home-appointments.scss';

const HomeAppointments = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <AppointmentsList
        date={toOmrsIsoString(dayjs().startOf('day').toDate())}
        excludeCancelledAppointments
      />
    </div>
  );
};

export default HomeAppointments;
