import React from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentsList from '../appointments/scheduled/appointments-list.component';
import dayjs from 'dayjs';
import styles from './home-appointments.scss';
import { toOmrsIsoString } from '@openmrs/esm-framework';

const HomeAppointments = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <AppointmentsList
        date={toOmrsIsoString(dayjs().startOf('day').toDate())}
        title={t('todays', "Today's")}
        filterCancelled={true}
      />
    </div>
  );
};

export default HomeAppointments;
