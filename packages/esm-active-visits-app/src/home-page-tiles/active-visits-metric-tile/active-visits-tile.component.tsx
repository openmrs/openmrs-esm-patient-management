import React from 'react';
import { Tile } from '@carbon/react';
import styles from '../homepage-tiles.scss';
import { useTranslation } from 'react-i18next';
import useActiveVisits from './active-visits.resources';

const ActiveVisitsTile: React.FC = () => {
  const { data: activeVisitsData } = useActiveVisits();

  const { t } = useTranslation();
  return (
    <Tile className={styles.tileContainer}>
      <div className={styles.tileContent}>
        <header className={styles.tileHeader}>{t('activeVisits', 'Active Visits')}</header>
        <div className={styles.displayDetails}>
          <div className={styles.countLabel}>{t('patients', 'Patients')}</div>
          <div className={styles.displayData}>{activeVisitsData?.length ?? 0}</div>
        </div>
      </div>
    </Tile>
  );
};

export default ActiveVisitsTile;
