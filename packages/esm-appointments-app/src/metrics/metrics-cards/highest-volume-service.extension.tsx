import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import MetricsCard from './metrics-card.component';
import MetricsErrorCard from './metrics-error-card.component';
import { useAppointmentsAppContext } from '../../hooks/useAppointmentsAppContext';
import { useSelectedDate } from '../../hooks/useSelectedDate';

export default function HighestVolumeServiceExtension() {
  const { t } = useTranslation();
  const { appointmentForSelectedDateFilteredByServiceTypes, error } = useAppointmentsAppContext();
  const selectedDate = useSelectedDate();
  const formattedStartDate = formatDate(parseDate(selectedDate), { mode: 'standard', time: false });

  const highestServiceLoad = useMemo(() => {
    const serviceVolumeMap = new Map<string, number>();
    const serviceNameMap = new Map<string, string>();
    for (const appointment of appointmentForSelectedDateFilteredByServiceTypes) {
      const serviceUuid = appointment.service?.uuid;
      const serviceName = appointment.service?.name;
      if (serviceUuid && serviceName) {
        serviceVolumeMap.set(serviceUuid, (serviceVolumeMap.get(serviceUuid) ?? 0) + 1);
        serviceNameMap.set(serviceUuid, serviceName);
      }
    }

    let highestServiceLoad: { serviceUuid: string; serviceName: string; count: number } | null = null;
    for (const [serviceUuid, count] of serviceVolumeMap.entries()) {
      if (!highestServiceLoad || count > highestServiceLoad.count) {
        highestServiceLoad = { serviceUuid, serviceName: serviceNameMap.get(serviceUuid) ?? '', count };
      }
    }
    return highestServiceLoad;
  }, [appointmentForSelectedDateFilteredByServiceTypes]);

  if (error) {
    return <MetricsErrorCard headerLabel={t('highestServiceVolumeCardTitle', 'Highest volume service')} />;
  }

  return (
    <MetricsCard
      headerLabel={t('highestServiceVolume', 'Highest volume service: {{time}}', { time: formattedStartDate })}
      label={highestServiceLoad ? t(highestServiceLoad.serviceName) : t('serviceName', 'Service name')}
      value={highestServiceLoad?.count ?? '--'}
    />
  );
}
