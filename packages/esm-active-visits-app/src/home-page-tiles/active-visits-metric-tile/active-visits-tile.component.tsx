import React from 'react';
import { Tile } from '@carbon/react';
import styles from '../homepage-tiles.scss';
import { useTranslation } from 'react-i18next';
import useActiveVisits from './active-visits-tile.resources';

const ActiveVisitsTile: React.FC = () => {
  const { data: activeVisitsData } = useActiveVisits();

  const { t } = useTranslation();
  return (
    <React.Fragment>
      <Tile className={styles.tileContainer}>
        <div>
          <div className={styles.tileContent}>
            <div className={styles.tileHeader}>
              <header>{t('activeVisits', 'Active Visits')}</header>
            </div>
            <div className={styles.displayDetails}>
              <div className={styles.countLabel}>Patients</div>
              <div className={styles.displayData}>{activeVisitsData?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </Tile>
    </React.Fragment>
  );
};

export default ActiveVisitsTile;
