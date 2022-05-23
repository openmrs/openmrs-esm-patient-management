import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from 'carbon-components-react';
import { useMetrics } from './appointment-metrics.resource';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';

const AppointmentsMetrics: React.FC = () => {
  const { t } = useTranslation();
  const { metrics, isError, isLoading } = useMetrics();

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer}>
        <MetricsCard
          label={t('appointments', 'Appointments')}
          value={metrics ? metrics.scheduled_appointments : 0}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
        />
        <MetricsCard
          label={t('appointments', 'Appointments')}
          value={metrics ? metrics.missed_appointments : 0}
          headerLabel={t('missedAppointments', 'Missed appts. today')}
        />
        <MetricsCard
          label={t('providers', 'Providers')}
          value={metrics ? metrics.providers_available_today : 0}
          headerLabel={t('providersAvailableToday', 'Providers available today')}
        />
      </div>
    </>
  );
};

export default AppointmentsMetrics;
