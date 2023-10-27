import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import { useClinicalMetrics, useAllAppointmentsByDate, useScheduledAppointment } from '../hooks/useClinicalMetrics';
import { useAppointmentDate } from '../helpers';
import { useAppointmentList } from '../hooks/useAppointmentList';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';

interface AppointmentMetricsProps {
  serviceUuid: string;
}

const AppointmentsMetrics: React.FC<AppointmentMetricsProps> = ({ serviceUuid }) => {
  const { t } = useTranslation();

  const { highestServiceLoad, error: clinicalMetricsError } = useClinicalMetrics();
  const { totalProviders, isLoading: allAppointmentsLoading } = useAllAppointmentsByDate();
  const { totalScheduledAppointments } = useScheduledAppointment(serviceUuid);

  const { currentAppointmentDate } = useAppointmentDate();
  const formattedStartDate = formatDate(parseDate(currentAppointmentDate), { mode: 'standard', time: false });

  const { appointmentList: arrivedAppointments } = useAppointmentList('Honoured');
  const { appointmentList: pendingAppointments } = useAppointmentList('Pending');

  const filteredArrivedAppointments = serviceUuid
    ? arrivedAppointments.filter(({ serviceTypeUuid }) => serviceTypeUuid === serviceUuid)
    : arrivedAppointments;
  const filteredPendingAppointments = serviceUuid
    ? pendingAppointments.filter(({ serviceTypeUuid }) => serviceTypeUuid === serviceUuid)
    : pendingAppointments;

  if (clinicalMetricsError) {
    return (
      <ErrorState headerTitle={t('appointmentMetricsLoadError', 'Metrics load error')} error={clinicalMetricsError} />
    );
  }

  return (
    <>
      <MetricsHeader />
      <div className={styles.cardContainer} data-testid="clinic-metrics">
        <MetricsCard
          label={t('patients', 'Patients')}
          value={totalScheduledAppointments}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
          count={{ pendingAppointments: filteredPendingAppointments, arrivedAppointments: filteredArrivedAppointments }}
          appointmentDate={currentAppointmentDate}
        />
        <MetricsCard
          label={
            highestServiceLoad?.count !== 0 ? t(highestServiceLoad?.serviceName) : t('serviceName', 'Service name')
          }
          value={highestServiceLoad?.count ?? '--'}
          headerLabel={t('highestServiceVolume', 'High volume service: {time}', { time: formattedStartDate })}
        />
        <MetricsCard
          label={t('providers', 'Providers')}
          value={totalProviders}
          headerLabel={t('providersAvailableToday', 'Providers available: {time}', { time: formattedStartDate })}
        />
      </div>
    </>
  );
};

export default AppointmentsMetrics;
