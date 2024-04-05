import React from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentsList from '../appointments/scheduled/appointments-list.component';
import dayjs from 'dayjs';
import styles from './index.scss';
import Overlay from '../overlay.component';

const HomeAppointments = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <AppointmentsList
        date={dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZZ')}
        title={t('todays', "Today's")}
      />
      <Overlay />
    </div>
  );
};

export default HomeAppointments;
