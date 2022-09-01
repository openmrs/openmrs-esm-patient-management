import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import styles from './metrics-card.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
  view: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, children, view }) => {
  const { t } = useTranslation();
  const metricsLink = {
    patients: 'appointments-list/scheduled',
    highVolume: 'high-volume-service',
    providers: 'providers-link',
  };

  return (
    <Tile className={styles.tileContainer} light={true}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/${metricsLink[view]}`}>
          {t('view', 'View')} <ArrowRight size={16} className={styles.viewListBtn} />
        </ConfigurableLink>
      </div>
      <div>
        <label className={styles.totalsLabel}>{label}</label>
        <p className={styles.totalsValue}>{value}</p>
      </div>
    </Tile>
  );
};

export default MetricsCard;
