import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { ConfigurableLink } from '@openmrs/esm-framework';
import styles from './metrics-card.scss';

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
  service?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, children, service }) => {
  const { t } = useTranslation();

  return (
    <Layer className={styles.container}>
      <Tile className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <label className={styles.headerLabel}>{headerLabel}</label>
            {children}
          </div>
          {service == 'scheduled' ? (
            <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/appointments-list/${service}`}>
              {t('patientList', 'Patient list')} <ArrowRight size={16} className={styles.patientListBtn} />
            </ConfigurableLink>
          ) : (
            <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/queue-list/${service}`}>
              {t('patientList', 'Patient list')} <ArrowRight size={16} className={styles.patientListBtn} />
            </ConfigurableLink>
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
