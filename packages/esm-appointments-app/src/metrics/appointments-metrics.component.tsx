import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import { useClinicalMetrics, useAllAppointmentsByDate, useScheduledAppointment } from '../hooks/useClinicalMetrics';
import { useAppointmentList } from '../hooks/useAppointmentList';
import MetricsCard from './metrics-card.component';
import MetricsHeader from './metrics-header.component';
import styles from './appointments-metrics.scss';
import SelectedDateContext from '../hooks/selectedDateContext';

interface AppointmentMetricsProps {
  appointmentServiceType: string;
}

const AppointmentsMetrics: React.FC<AppointmentMetricsProps> = ({ appointmentServiceType }) => {
  const { t } = useTranslation();

  const { highestServiceLoad, error: clinicalMetricsError } = useClinicalMetrics();
  const { totalProviders } = useAllAppointmentsByDate();
  const { totalScheduledAppointments } = useScheduledAppointment(appointmentServiceType);
  const { selectedDate } = useContext(SelectedDateContext);
  const formattedStartDate = formatDate(parseDate(selectedDate), { mode: 'standard', time: false });

  // TODO we will need rework these after we discuss the logic we want to use
  const { appointmentList: arrivedAppointments } = useAppointmentList('CheckedIn');
  const { appointmentList: pendingAppointments } = useAppointmentList('Scheduled');

  const filteredArrivedAppointments = appointmentServiceType
    ? arrivedAppointments.filter(({ service }) => service.uuid === appointmentServiceType)
    : arrivedAppointments;
  const filteredPendingAppointments = appointmentServiceType
    ? pendingAppointments.filter(({ service }) => service.uuid === appointmentServiceType)
    : pendingAppointments;
  const totalPatients = filteredArrivedAppointments.length + filteredPendingAppointments.length;

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
          value={totalPatients}
          headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
          count={{ pendingAppointments: filteredPendingAppointments, arrivedAppointments: filteredArrivedAppointments }}
        />
        <MetricsCard
          label={
            highestServiceLoad?.count !== 0 ? t(highestServiceLoad?.serviceName) : t('serviceName', 'Service name')
          }
          value={highestServiceLoad?.count ?? '--'}
          headerLabel={t('highestServiceVolume', 'Highest volume service: {{time}}', { time: formattedStartDate })}
        />
        <MetricsCard
          label={t('providers', 'Providers')}
          value={totalProviders}
          headerLabel={t('providersBooked', 'Providers booked: {{time}}', { time: formattedStartDate })}
        />
      </div>
    </>
  );
};

export default AppointmentsMetrics;
