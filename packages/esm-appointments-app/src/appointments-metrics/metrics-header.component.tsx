import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Add } from '@carbon/react/icons';
import styles from './metrics-header.scss';
import { ConfigurableLink, navigate } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import { launchOverlay } from '../hooks/useOverlay';
import AppointmentServices from '../admin/appointment-services/appointment-services.component';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <div className={styles.metricsContent}>
        <Button
          renderIcon={ArrowRight}
          onClick={() => navigate({ to: `\${openmrsSpaBase}/appointments/missed` })}
          kind="ghost">
          {t('seeMissedAppointments', 'See missed appointments')}
        </Button>
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
