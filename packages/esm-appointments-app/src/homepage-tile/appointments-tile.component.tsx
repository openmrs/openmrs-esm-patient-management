import React from 'react';
import { Tile } from '@carbon/react';
import styles from './appointments-tile.scss';
import { useTranslation } from 'react-i18next';
import useAppointmentsData from './appointments-tile.resources';

const AppointmentsTile: React.FC = () => {
  const { data: appointmentsData } = useAppointmentsData();

  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Tile className={styles.tileContainer}>
        <div>
          <div className={styles.tileContent}>
            <div className={styles.tileHeader}>
              <header>{t('scheduledForToday', 'Scheduled For Today')}</header>
            </div>
            <div className={styles.displayDetails}>
              <div className={styles.countLabel}>Patients</div>
              <div className={styles.displayData}>{appointmentsData?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </Tile>
    </React.Fragment>
  );
};

export default AppointmentsTile;
