import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import { useClinicalMetrics, useAllAppointmentsByDate, useScheduledAppointments } from '../hooks/useClinicalMetrics';
import { useAppointmentList } from '../hooks/useAppointmentList';
import { useSelectedDateContext } from '../hooks/selected-date-context';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';

interface AppointmentMetricsProps {
  appointmentServiceTypes: Array<string>;
}

const AppointmentsMetrics: React.FC<AppointmentMetricsProps> = ({ appointmentServiceTypes }) => {
  const { t } = useTranslation();

  const { highestServiceLoad, error } = useClinicalMetrics();
  const { totalProviders } = useAllAppointmentsByDate();
  const { totalScheduledAppointments } = useScheduledAppointments(appointmentServiceTypes);

  const { selectedDate } = useSelectedDateContext();
  const formattedStartDate = formatDate(parseDate(selectedDate), { mode: 'standard', time: false });

  // TODO we will need rework these after we discuss the logic we want to use
  const { appointmentList: arrivedAppointments } = useAppointmentList('CheckedIn');
  const { appointmentList: pendingAppointments } = useAppointmentList('Scheduled');

  const filteredArrivedAppointments = appointmentServiceTypes
    ? arrivedAppointments.filter(({ service }) => appointmentServiceTypes.includes(service.uuid))
    : arrivedAppointments;

  const filteredPendingAppointments = appointmentServiceTypes
    ? pendingAppointments.filter(({ service }) => appointmentServiceTypes.includes(service.uuid))
    : pendingAppointments;

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorState headerTitle={t('appointmentMetricsLoadError', 'Metrics load error')} error={error} />
      </div>
    );
  }

  return (
    <>
      <MetricsHeader />
      <section className={styles.cardContainer}>
        <MetricsCard
          count={{ pendingAppointments: filteredPendingAppointments, arrivedAppointments: filteredArrivedAppointments }}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
          label={t('appointments', 'Appointments')}
          value={totalScheduledAppointments}
        />
        <MetricsCard
          headerLabel={t('highestServiceVolume', 'Highest volume service: {{time}}', { time: formattedStartDate })}
          label={
            highestServiceLoad?.count !== 0 ? t(highestServiceLoad?.serviceName) : t('serviceName', 'Service name')
          }
          value={highestServiceLoad?.count ?? '--'}
        />
        <MetricsCard
          headerLabel={t('providersBooked', 'Providers booked: {{time}}', { time: formattedStartDate })}
          label={t('providers', 'Providers')}
          value={totalProviders}
        />
      </section>
    </>
  );
};

export default AppointmentsMetrics;
