import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MetricsCard from './metrics-card.component';
import { useAppointmentsAppContext } from '../../hooks/useAppointmentsAppContext';

/**
 * This extension shows the metrics of the number of scheduled appointments for the selected date and services,
 * showing the total number of appointments (across all status), the number of checked in ones (status == CheckedIn),
 * and number of not arrived (status == Scheduled).
 *
 */
export default function ScheduledAppointmentsExtension() {
  const { t } = useTranslation();
  const { appointmentForSelectedDateFilteredByServiceTypes } = useAppointmentsAppContext();

  const totalScheduledAppointments = appointmentForSelectedDateFilteredByServiceTypes.length;

  const count = useMemo(() => {
    const arrivedAppointments = appointmentForSelectedDateFilteredByServiceTypes.filter(
      ({ status }) => status === 'CheckedIn',
    );
    const pendingAppointments = appointmentForSelectedDateFilteredByServiceTypes.filter(
      ({ status }) => status === 'Scheduled',
    );

    return { pendingAppointments, arrivedAppointments };
  }, [appointmentForSelectedDateFilteredByServiceTypes]);

  return (
    <MetricsCard
      count={count}
      headerLabel={t('scheduledAppointments', 'Scheduled appointments')}
      label={t('appointments', 'Appointments')}
      value={totalScheduledAppointments}
    />
  );
}
