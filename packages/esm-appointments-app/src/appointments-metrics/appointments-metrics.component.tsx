import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import { useClinicalMetrics, useAllAppointmentsByDate, useScheduledAppointment } from '../hooks/useClinicalMetrics';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';
import { useAppointmentDate } from '../helpers';
import useAppointmentList from '../hooks/useAppointmentList';

const AppointmentsMetrics: React.FC<{ serviceUuid: string }> = ({ serviceUuid }) => {
  const { t } = useTranslation();
  const { highestServiceLoad, isLoading, error } = useClinicalMetrics();
  const { totalProviders, isLoading: loading } = useAllAppointmentsByDate();
  const { totalScheduledAppointments } = useScheduledAppointment(serviceUuid);
  const startDate = useAppointmentDate();
  const formattedStartDate = formatDate(parseDate(startDate), { mode: 'standard', time: false });
  const { appointmentList: arrivedAppointments } = useAppointmentList('Honoured');
  const { appointmentList: pendingAppointments } = useAppointmentList('Pending');
  const filteredArrivedAppointment = serviceUuid
    ? arrivedAppointments.filter((arrivedAppt) => arrivedAppt.serviceTypeUuid === serviceUuid)
    : arrivedAppointments;

  const filteredPendingAppointment = serviceUuid
    ? pendingAppointments.filter((arrivedAppt) => arrivedAppt.serviceTypeUuid === serviceUuid)
    : pendingAppointments;

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
        <MetricsCard
          label={t('patients', 'Patients')}
          value={totalScheduledAppointments}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
          view="patients"
          count={{ pendingAppointments: filteredPendingAppointment, arrivedAppointments: filteredArrivedAppointment }}
          appointmentDate={startDate}
        />
        <MetricsCard
          label={
            highestServiceLoad?.count !== 0 ? t(highestServiceLoad?.serviceName) : t('serviceName', 'Service name')
          }
          value={highestServiceLoad?.count ?? '--'}
          headerLabel={t('highestServiceVolume', 'High volume Service : {time}', { time: formattedStartDate })}
          view=""
        />
        <MetricsCard
          label={t('providers', 'Providers')}
          value={totalProviders}
          headerLabel={t('providersAvailableToday', 'Providers available : {time}', { time: formattedStartDate })}
          view=""
        />
      </div>
    </>
  );
};

export default AppointmentsMetrics;
