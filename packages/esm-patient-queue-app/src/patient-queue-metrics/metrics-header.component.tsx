import React from 'react';
import styles from './metrics-header.scss';
import { useTranslation } from 'react-i18next';
import { Button } from 'carbon-components-react';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';

interface MetricsHeaderComponentProps {}
const MetricsHeaderComponent: React.FC<MetricsHeaderComponentProps> = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('clinicMetrics', 'Clinic metrics')}</span>
      <Button kind="ghost" renderIcon={ArrowRight16} iconDescription={t('moreMetrics', 'See more metrics')}>
        {t('moreMetrics', 'See more metrics')}
      </Button>
    </div>
  );
};

export default MetricsHeaderComponent;
