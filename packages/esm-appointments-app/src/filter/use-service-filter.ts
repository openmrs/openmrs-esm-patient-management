import { useState, useCallback } from 'react';
import { useAppointmentServices } from '../hooks/useAppointmentService';

export function useServiceFilter() {
  const { serviceTypes, isLoading, error } = useAppointmentServices();
  const [selectedServiceUuids, setSelectedServiceUuids] = useState<string[]>([]);

  const onServiceChange = useCallback((serviceUuids: string[]) => setSelectedServiceUuids(serviceUuids), []);

  return { selectedServiceUuids, serviceTypes, onServiceChange, isLoading, error };
}
