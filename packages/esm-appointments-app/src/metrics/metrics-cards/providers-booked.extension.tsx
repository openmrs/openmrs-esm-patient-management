import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import MetricsCard from './metrics-card.component';
import { useAppointmentsAppContext } from '../../hooks/useAppointmentsAppContext';
import { useSelectedDate } from '../../hooks/useSelectedDate';

export default function ProvidersBookedExtension() {
  const { t } = useTranslation();
  const selectedDate = useSelectedDate();
  const { appointmentForSelectedDateFilteredByServiceTypes } = useAppointmentsAppContext();

  const totalProviders = useMemo(() => {
    return appointmentForSelectedDateFilteredByServiceTypes.reduce((providersSet, appointment) => {
      appointment.providers?.forEach((provider) => providersSet.add(provider.uuid));
      return providersSet;
    }, new Set<string>()).size;
  }, [appointmentForSelectedDateFilteredByServiceTypes]);

  const formattedStartDate = formatDate(parseDate(selectedDate), { mode: 'standard', time: false });

  return (
    <MetricsCard
      headerLabel={t('providersBooked', 'Providers booked: {{time}}', { time: formattedStartDate })}
      label={t('providers', 'Providers')}
      value={totalProviders}
    />
  );
}
