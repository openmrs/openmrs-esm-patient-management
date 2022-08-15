import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import styles from './metrics-header.scss';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <Button
        renderIcon={(props) => <ArrowRight size={16} {...props} />}
        kind="ghost"
        iconDescription={t('moreMetrics', 'See more metrics')}>
        {t('moreMetrics', 'See more metrics')}
      </Button>
    </div>
  );
};

export default MetricsHeader;
