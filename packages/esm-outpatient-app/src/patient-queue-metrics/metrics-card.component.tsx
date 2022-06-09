import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, Button } from 'carbon-components-react';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import styles from './metrics-card.scss';
import { navigate, ConfigurableLink } from '@openmrs/esm-framework';

interface MetricsCardProps {
  label: string;
  value: number;
  headerLabel: string;
  service?: string;
  children?: React.ReactNode;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, headerLabel, children, service }) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer} light={true}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        {service == 'scheduled' ? (
          <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/appointments-list/${service}`}>
            {t('patientList', 'Patient list')} <ArrowRight16 className={styles.patientListBtn} />
          </ConfigurableLink>
        ) : (
          <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/queue-list/${service}`}>
            {t('patientList', 'Patient list')} <ArrowRight16 className={styles.patientListBtn} />
          </ConfigurableLink>
        )}
      </div>
      <div>
        <label className={styles.totalsLabel}>{label}</label>
        <p className={styles.totalsValue}>{value}</p>
      </div>
    </Tile>
  );
};

export default MetricsCard;
