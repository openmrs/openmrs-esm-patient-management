import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from 'carbon-components-react';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';
import { ErrorState } from '@openmrs/esm-framework';
import { useClinicalMetrics } from '../hooks/useClinicalMetrics';

const AppointmentsMetrics: React.FC = () => {
  const { t } = useTranslation();
  const { totalAppointments, highestServiceLoad, isLoading, error } = useClinicalMetrics();

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading...')} />;
  }

  if (error) {
    <ErrorState headerTitle={t('errorAppoinmentMetric')} error={error} />;
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer}>
        <MetricsCard
          label={t('patients', 'Patients')}
          value={totalAppointments}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
        />
        <MetricsCard
          label={t(highestServiceLoad?.serviceName)}
          value={highestServiceLoad?.count ?? '--'}
          headerLabel={t('highestServiceVolume', 'High volume Service.  today')}
        />
        <MetricsCard
          label={t('providers', 'Providers')}
          value={0}
          headerLabel={t('providersAvailableToday', 'Providers available today')}
        />
      </div>
    </>
  );
};

export default AppointmentsMetrics;
function useAppointmentsMetrics(): { metrics: any; isError: any; isLoading: any } {
  throw new Error('Function not implemented.');
}
