import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from 'carbon-components-react';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
}

const MetricsCardAvgWaitTime: React.FC<MetricsCardProps> = ({ label, value, headerLabel, children }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer} light={true}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
      </div>
      <div>
        <label className={styles.totalsLabel}>{label}</label>
        <p className={styles.totalsValue}>{value}</p>
      </div>
    </Tile>
  );
};

export default MetricsCardAvgWaitTime;
