import React from 'react';
import { Tile } from '@carbon/react';
import styles from '../homepage-tiles.scss';
import { useTranslation } from 'react-i18next';
import useTotalVisits from './total-visits-tile.resources';

const TotalVisitsTile: React.FC = () => {
  const { data: visitsData } = useTotalVisits();

  const { t } = useTranslation();

  return (
    <>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileContent}>
          <header className={styles.tileHeader}>{t('totalVisits', 'Total Visits Today')}</header>
          <div className={styles.displayDetails}>
            <div className={styles.countLabel}>{t('patients', 'Patients')}</div>
            <div className={styles.displayData}>{visitsData?.length ?? 0}</div>
          </div>
        </div>
      </Tile>
    </>
  );
};

export default TotalVisitsTile;
