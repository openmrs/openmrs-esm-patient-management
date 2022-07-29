import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from 'carbon-components-react';
import { useAppointmentsMetrics } from './appointment-metrics.resource';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';
import { ErrorState } from '@openmrs/esm-framework';

const AppointmentsMetrics: React.FC = () => {
  const { t } = useTranslation();
  const { metrics, isError, isLoading } = useAppointmentsMetrics();

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (isError) {
    <ErrorState headerTitle={t('errorAppoinmentMetric')} error={isError} />;
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer}>
        <MetricsCard
          label={t('appointments', 'Appointments')}
          value={metrics ? metrics.scheduleAppointments : 0}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
        />
        <MetricsCard
          label={t('appointments', 'Appointments')}
          value={metrics ? metrics.missedAppointments : 0}
          headerLabel={t('missedAppointments', 'Missed appts. today')}
        />
        <MetricsCard
          label={t('providers', 'Providers')}
          value={metrics ? metrics.providersAvailableToday : 0}
          headerLabel={t('providersAvailableToday', 'Providers available today')}
        />
      </div>
    </>
  );
};

export default AppointmentsMetrics;
