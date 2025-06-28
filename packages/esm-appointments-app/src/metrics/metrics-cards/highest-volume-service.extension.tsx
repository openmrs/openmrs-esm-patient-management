import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricsCard from './metrics-card.component';
import MetricsErrorCard from './metrics-error-card.component';
import { useClinicalMetrics } from '../../hooks/useClinicalMetrics';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { useAppointmentsStore } from '../../store';

export default function HighestVolumeServiceExtension() {
  const { t } = useTranslation();
  const { highestServiceLoad, error } = useClinicalMetrics();
  const { selectedDate } = useAppointmentsStore();
  const formattedStartDate = formatDate(parseDate(selectedDate), { mode: 'standard', time: false });

  if (error) {
    return <MetricsErrorCard headerLabel={t('highestServiceVolumeCardTitle', 'Highest volume service')} />;
  }

  return (
    <MetricsCard
      headerLabel={t('highestServiceVolume', 'Highest volume service: {{time}}', { time: formattedStartDate })}
      label={highestServiceLoad?.count !== 0 ? t(highestServiceLoad?.serviceName) : t('serviceName', 'Service name')}
      value={highestServiceLoad?.count ?? '--'}
    />
  );
}
