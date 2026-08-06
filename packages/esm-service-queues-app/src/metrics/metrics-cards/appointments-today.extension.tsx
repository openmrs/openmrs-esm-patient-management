import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricsCard, MetricsCardBody, MetricsCardHeader, MetricsCardItem } from './metrics-card.component';
import { useExpectedAppointments } from '../../hooks/useExpectedAppointments';
import { useServiceQueuesStore } from '../../store/store';

export default function AppointmentsTodayExtension() {
  const { t } = useTranslation();
  const { selectedQueueLocationUuid } = useServiceQueuesStore();
  const { appointments, isLoading, error } = useExpectedAppointments(selectedQueueLocationUuid);

  useEffect(() => {
    if (error) {
      console.error('Failed to load appointments for the Appointments today metric: ', error);
    }
  }, [error]);

  return (
    <MetricsCard>
      <MetricsCardHeader title={t('appointmentsToday', 'Appointments today')} />
      <MetricsCardBody>
        <MetricsCardItem value={isLoading || error ? '--' : appointments.length} />
      </MetricsCardBody>
    </MetricsCard>
  );
}
