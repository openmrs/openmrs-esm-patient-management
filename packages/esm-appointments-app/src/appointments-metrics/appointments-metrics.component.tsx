import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { ErrorState, formatDate, formatDatetime, parseDate } from '@openmrs/esm-framework';
import {
  useClinicalMetrics,
  useAllAppointmentsByDate,
  useScheduledAppointment,
  useActiveVisits,
} from '../hooks/useClinicalMetrics';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';
import { useAppointmentDate } from '../helpers';
import MetricsCardScheduledAppt from './metric-card-scheduled-app.component';

const AppointmentsMetrics: React.FC = () => {
  const { t } = useTranslation();
  const { highestServiceLoad, isLoading, error } = useClinicalMetrics();
  const { totalProviders, isLoading: loading } = useAllAppointmentsByDate();
  const { totalScheduledAppointments } = useScheduledAppointment();
  const startDate = useAppointmentDate();
  const { activeVisits } = useActiveVisits();
  var notArrived = totalScheduledAppointments - activeVisits;
  const formattedStartDate = formatDate(parseDate(startDate), { mode: 'standard', time: false });

  if (isLoading || loading) {
    return <InlineLoading role="progressbar" description={t('loading', 'Loading...')} />;
  }

  if (error) {
    <ErrorState headerTitle={t('errorAppoinmentMetric')} error={error} />;
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer}>
        <MetricsCardScheduledAppt
          label={t('patients', 'Patients')}
          value={totalScheduledAppointments}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
          view="patients"
          arrivedLabel={t('checkedIn', 'Checked In')}
          arrivedValue={activeVisits}
          notArrivedLabel={t('pending', 'Pending')}
          notArrivedValue={notArrived}
        />
        <MetricsCard
          label={t(highestServiceLoad?.serviceName)}
          value={highestServiceLoad?.count ?? '--'}
          headerLabel={t('highestServiceVolume', 'High volume Service : {time}', { time: formattedStartDate })}
          view="highVolume"
        />
        <MetricsCard
          label={t('providers', 'Providers')}
          value={totalProviders}
          headerLabel={t('providersAvailableToday', 'Providers available : {time}', { time: formattedStartDate })}
          view="providers"
        />
      </div>
    </>
  );
};

export default AppointmentsMetrics;
