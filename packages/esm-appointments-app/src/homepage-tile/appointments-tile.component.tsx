import React from 'react';
import { Tile } from '@carbon/react';
import styles from './appointments-tile.scss';
import { useTranslation } from 'react-i18next';
import useAppointmentsData from './appointments.resource';

const AppointmentsTile: React.FC = () => {
  const { data: appointmentsData } = useAppointmentsData();

  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer}>
      <header className={styles.tileHeader}>{t('scheduledForToday', 'Scheduled For Today')}</header>
      <div className={styles.displayDetails}>
        <div className={styles.countLabel}>{t('patients', 'Patients')}</div>
        <div className={styles.displayData}>{appointmentsData?.length ?? 0}</div>
      </div>
    </Tile>
  );
};

export default AppointmentsTile;
