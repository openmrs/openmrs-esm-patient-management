import React from 'react';
import { Layer, Tile } from '@carbon/react';
import styles from './ward-card.scss';

interface WardCardProps {
  label: string;
  value: number | string;
  headerLabel: string;
  children?: React.ReactNode;
  service?: string;
  serviceUuid?: string;
  locationUuid?: string;
}

const WardCard: React.FC<WardCardProps> = ({ children, headerLabel, label, value }) => {
  return (
    <Layer className={`${children && styles.cardWithChildren} ${styles.container}`}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
          </div>
          {children}
        </div>
        <div>
          <label className={styles.totalsLabel}>{label}</label>
          <p className={styles.totalsValue}>{value}</p>
        </div>
      </Tile>
    </Layer>
  );
};

export default WardCard;
