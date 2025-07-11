import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricsCard from './metrics-card.component';
import { useScheduledAppointments } from '../../hooks/useClinicalMetrics';
import { useAppointmentsStore } from '../../store';
import { useAppointmentList } from '../../hooks/useAppointmentList';

export default function ScheduledAppointmentsExtension() {
  const { t } = useTranslation();
  const { appointmentServiceTypes } = useAppointmentsStore();

  const { appointmentList: arrivedAppointments } = useAppointmentList('CheckedIn');
  const { appointmentList: pendingAppointments } = useAppointmentList('Scheduled');

  const { totalScheduledAppointments } = useScheduledAppointments(appointmentServiceTypes);

  const filteredArrivedAppointments = appointmentServiceTypes
    ? arrivedAppointments.filter(({ service }) => appointmentServiceTypes.includes(service.uuid))
    : arrivedAppointments;

  const filteredPendingAppointments = appointmentServiceTypes
    ? pendingAppointments.filter(({ service }) => appointmentServiceTypes.includes(service.uuid))
    : pendingAppointments;

  return (
    <MetricsCard
      count={{ pendingAppointments: filteredPendingAppointments, arrivedAppointments: filteredArrivedAppointments }}
      headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
      label={t('appointments', 'Appointments')}
      value={totalScheduledAppointments}
    />
  );
}
