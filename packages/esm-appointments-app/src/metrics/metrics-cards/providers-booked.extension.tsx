import React from 'react';
import MetricsCard from './metrics-card.component';
import { useTranslation } from 'react-i18next';
import { useAllAppointmentsByDate } from '../../hooks/useClinicalMetrics';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { useAppointmentsStore } from '../../store';

export default function ProvidersBookedExtension() {
  const { t } = useTranslation();
  const { totalProviders } = useAllAppointmentsByDate();
  const { selectedDate } = useAppointmentsStore();
  const formattedStartDate = formatDate(parseDate(selectedDate), { mode: 'standard', time: false });

  return (
    <MetricsCard
      headerLabel={t('providersBooked', 'Providers booked: {{time}}', { time: formattedStartDate })}
      label={t('providers', 'Providers')}
      value={totalProviders}
    />
  );
}
