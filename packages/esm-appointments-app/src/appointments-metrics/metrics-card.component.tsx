import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import styles from './metrics-card.scss';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
  view: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, children, view }) => {
  const { t } = useTranslation();
  const { scheduledAppointmentListUrl } = useConfig() as ConfigObject;

  return (
    <Tile className={styles.tileContainer} light={true}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        {view === 'patients' ? (
          <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/${scheduledAppointmentListUrl}`}>
            {t('view', 'View')} <ArrowRight size={16} className={styles.viewListBtn} />
          </ConfigurableLink>
        ) : view === 'providers' ? (
          <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/providers/`}>
            {t('view', 'View')} <ArrowRight size={16} className={styles.viewListBtn} />
          </ConfigurableLink>
        ) : view === 'highVolume' ? (
          <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/high-volume-service/`}>
            {t('view', 'View')} <ArrowRight size={16} className={styles.viewListBtn} />
          </ConfigurableLink>
        ) : null}
      </div>
      <div>
        <label className={styles.totalsLabel}>{label}</label>
        <p className={styles.totalsValue}>{value}</p>
      </div>
    </Tile>
  );
};

export default MetricsCard;
