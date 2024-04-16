import React from 'react';
import { Tile } from '@carbon/react';
import styles from '../homepage-tiles.scss';
import { useTranslation } from 'react-i18next';
import useTotalVisits from './total-visits-tile.resources';

const TotalVisitsTile: React.FC = () => {
  const { data: appointmentsData } = useTotalVisits();

  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Tile className={styles.tileContainer}>
        <div>
          <div className={styles.tileContent}>
            <div className={styles.tileHeader}>
              <header>{t('totalVisits', 'Total Visits Today')}</header>
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

export default TotalVisitsTile;
