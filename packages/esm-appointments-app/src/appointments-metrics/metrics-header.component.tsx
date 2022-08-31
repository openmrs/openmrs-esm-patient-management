import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from '@carbon/react/icons';
import styles from './metrics-header.scss';
import { ConfigurableLink } from '@openmrs/esm-framework';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/appointments/missed`}>
        {t('seeMissedAppointments', 'See Missed Appointments')} <ArrowRight size={16} className={styles.viewListBtn} />
      </ConfigurableLink>
    </div>
  );
};

export default MetricsHeader;
