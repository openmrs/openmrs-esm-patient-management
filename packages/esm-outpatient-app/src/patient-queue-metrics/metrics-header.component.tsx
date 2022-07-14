import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import styles from './metrics-header.scss';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('clinicMetrics', 'Clinic metrics')}</span>
      <Button
        kind="ghost"
        renderIcon={(props) => <ArrowRight size={16} {...props} />}
        iconDescription={t('moreMetrics', 'See more metrics')}>
        {t('moreMetrics', 'See more metrics')}
      </Button>
    </div>
  );
};

export default MetricsHeader;
