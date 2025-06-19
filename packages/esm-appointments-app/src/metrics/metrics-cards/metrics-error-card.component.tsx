import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './metrics-error-card.scss';

interface MetricsCardProps {
  headerLabel: string;
}

const MetricsErrorCard: React.FC<MetricsCardProps> = ({ headerLabel }) => {
  const { t } = useTranslation();

  return (
    <article className={styles.container}>
      <div className={styles.tileContainer}>
        <div className={styles.tileHeader}>
          <div className={styles.headerLabelContainer}>
            <span className={styles.errorHeaderLabel}>
              {t('failedToLoadMetrics', 'Failed to load')} {headerLabel}
            </span>
          </div>
        </div>
        <div className={styles.errorMessage}>
          <p>{t('metricLoadErrorMessage', 'Please contact your system administrator if the problem persists.')}</p>
        </div>
      </div>
    </article>
  );
};

export default MetricsErrorCard;
