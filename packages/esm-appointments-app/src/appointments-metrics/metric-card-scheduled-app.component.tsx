/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import styles from './metric-card-scheduled-appt.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';

interface MetricsCardScheduledApptProps {
  label: string;
  value: number;
  arrivedLabel: string;
  arrivedValue: number;
  notArrivedLabel: string;
  notArrivedValue: number;
  headerLabel: string;
  children?: React.ReactNode;
  view: string;
}

const MetricsCardScheduledAppt: React.FC<MetricsCardScheduledApptProps> = ({
  label,
  value,
  arrivedLabel,
  arrivedValue,
  notArrivedLabel,
  notArrivedValue,
  headerLabel,
  children,
  view,
}) => {
  const { t } = useTranslation();
  const metricsLink = {
    patients: 'appointments-list/scheduled',
    highVolume: 'high-volume-service',
    providers: 'providers-link',
  };

  return (
    <Tile className={styles.tileContainer}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/${metricsLink[view]}`}>
          <span>{t('view', 'View')}</span> <ArrowRight size={16} className={styles.viewListBtn} />
        </ConfigurableLink>
      </div>
      <div className={styles.tilelabelContainer}>
        <div>
          <label className={styles.totalsLabel}>{label}</label>
          <p className={styles.totalsValue}>{value}</p>
        </div>
        <div className={styles.arrivedLabelContainer}>
          <div>
            <label className={styles.arrived}>{arrivedLabel}</label>
            <p className={styles.arrivedNumber}>{arrivedValue}</p>
          </div>
          <div>
            <label className={styles.notArrived}>{notArrivedLabel}</label>
            <p className={styles.notArrivedNumber}>{notArrivedValue}</p>
          </div>
        </div>
      </div>
    </Tile>
  );
};

export default MetricsCardScheduledAppt;
