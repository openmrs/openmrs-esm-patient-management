import { useState, useMemo, useCallback } from 'react';
import { useAppointmentServices } from '../hooks/useAppointmentService';

export interface ServiceFilterOption {
  uuid: string;
  label: string;
}

export function useServiceFilter() {
  const { serviceTypes } = useAppointmentServices();
  const [selectedServiceUuids, setSelectedServiceUuids] = useState<string[]>([]);

  const serviceOptions = useMemo<ServiceFilterOption[]>(
    () => serviceTypes.map((service) => ({ uuid: service.uuid, label: service.name })),
    [serviceTypes],
  );

  const onServiceChange = useCallback((selected: string[]) => setSelectedServiceUuids(selected), []);

  return { selectedServiceUuids, serviceTypes, serviceOptions, onServiceChange };
}
