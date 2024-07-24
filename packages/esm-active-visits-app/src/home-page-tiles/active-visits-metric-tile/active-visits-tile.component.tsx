import React from 'react';
import { Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import useActiveVisits from './active-visits.resource';
import styles from '../homepage-tiles.scss';

const ActiveVisitsTile: React.FC = () => {
  const { count } = useActiveVisits();

  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer}>
      <header className={styles.tileHeader}>{t('activeVisits', 'Active Visits')}</header>
      <div className={styles.displayDetails}>
        <div className={styles.countLabel}>{t('patients', 'Patients')}</div>
        <div className={styles.displayData}>{count ?? 0}</div>
      </div>
    </Tile>
  );
};

export default ActiveVisitsTile;
