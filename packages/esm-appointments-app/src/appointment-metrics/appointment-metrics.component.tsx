import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import { useAppointmentDate } from '../helpers';
import { useAppointments } from '../appointments-tabs/appointments-table.resource';
import { useClinicalMetrics, useAllAppointmentsByDate, useScheduledAppointment } from '../hooks/useClinicalMetrics';
import { useVisits } from '../hooks/useVisits';
import styles from './appointment-metrics.scss';

const AppointmentMetrics: React.FC = () => {
  const { t } = useTranslation();
  const { highestServiceLoad, isLoading, error } = useClinicalMetrics();
  const { totalProviders, isLoading: loading } = useAllAppointmentsByDate();
  const { totalScheduledAppointments } = useScheduledAppointment();
  const startDate = useAppointmentDate();
  const formattedStartDate = formatDate(parseDate(startDate), { mode: 'standard', time: false });
  const { appointments } = useAppointments();
  const { visits } = useVisits();

  const hashTable = new Map([]);
  visits?.map((visit) => hashTable.set(visit.patient.uuid, visit));
  const pendingAppointments = appointments.filter((appointment) => !hashTable.get(appointment.patientUuid));
  const arrivedAppointments = appointments.filter((appointment) => hashTable.get(appointment.patientUuid));

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
          count={{ pendingAppointments, arrivedAppointments }}
        />
        <MetricsCard
          label={
            highestServiceLoad?.count !== 0 ? t(highestServiceLoad?.serviceName) : t('serviceName', 'Service name')
          }
          value={highestServiceLoad?.count ?? '--'}
          headerLabel={t('highestServiceVolume', 'High volume service: {time}', { time: formattedStartDate })}
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

export default AppointmentMetrics;
