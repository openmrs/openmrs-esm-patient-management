import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  label: string;
  value: number | string;
  headerLabel: string;
  children?: React.ReactNode;
  service?: string;
  serviceUuid?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, children, service, serviceUuid }) => {
  const { t } = useTranslation();

  return (
    <Layer className={`${children && styles.cardWithChildren} ${styles.container}`}>
      <Tile className={`${styles.tileContainer}`}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
          {service == 'scheduled' ? (
            <div className={styles.link}>
              <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/checkedin-appointments-list`}>
                {t('patientList', 'Patient list')}
              </ConfigurableLink>
              <ArrowRight size={16} />
            </div>
          ) : service == 'waitTime' ? null : (
            <div className={styles.link}>
              <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/queue-list/${service}/${serviceUuid}/`}>
                {t('patientList', 'Patient list')}
              </ConfigurableLink>
              <ArrowRight size={16} />
            </div>
          )}
        </div>
        <div>
          <label className={styles.totalsLabel}>{label}</label>
          <p className={styles.totalsValue}>{value}</p>
        </div>
      </Tile>
    </Layer>
  );
};

export default MetricsCard;
