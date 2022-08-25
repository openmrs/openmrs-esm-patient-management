import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import styles from './metrics-header.scss';
import BookedAppointments from '../appointments-tabs/booked-appointments.component';
import { navigate } from '@openmrs/esm-framework';
import { spaBasePath } from '../constants';

const MetricsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{t('appointmentMetrics', 'Appointment metrics')}</span>
      <Button
        onClick={() => navigate({ to: `${spaBasePath}/missed` })}
        renderIcon={(props) => <ArrowRight size={16} {...props} />}
        kind="ghost"
        iconDescription={t('missedAppointment', 'See Missed Appointments')}>
        {t('missedAppointment', 'See Missed Appointments')}
      </Button>
    </div>
  );
};

export default MetricsHeader;
