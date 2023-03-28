import React from 'react';
import { useTranslation } from 'react-i18next';
import { Add } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { launchOverlay } from '../hooks/useOverlay';
import AppointmentServices from '../admin/appointment-services/appointment-services.component';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);
import styles from './metrics-header.scss';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <div className={styles.metricsContent}>
        <Button
          renderIcon={Add}
          onClick={() =>
            launchOverlay(t('createAppointmentService', 'Create appointment services'), <AppointmentServices />)
          }
          kind="ghost">
          {t('createAppointmentService', 'Create appointment services')}
        </Button>
      </div>
    </div>
  );
};

export default MetricsHeader;
