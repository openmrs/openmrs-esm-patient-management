import React from 'react';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
dayjs.extend(isToday);
import { useTranslation } from 'react-i18next';
import { Add, ArrowRight } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { launchOverlay } from '../hooks/useOverlay';
import AppointmentServices from '../admin/appointment-services/appointment-services.component';
import styles from './metrics-header.scss';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <div className={styles.metricsContent}>
        <ConfigurableLink className={styles.link} to={`\${openmrsSpaBase}/appointments/calendar`}>
          <span style={{ fontSize: '0.825rem', marginRight: '0.325rem' }}>{t('calendar', 'Calendar')}</span>{' '}
          <ArrowRight size={16} className={styles.viewListBtn} />
        </ConfigurableLink>
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
