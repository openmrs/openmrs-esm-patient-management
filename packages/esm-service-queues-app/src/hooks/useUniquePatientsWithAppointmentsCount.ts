import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Appointment } from '../types';
import dayjs from 'dayjs';

export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

export const useUniquePatientsWithAppointmentsCount = () => {
  const { data, error } = useAppointmentsForDate();

  const uniquePatientIds = new Set(data?.data?.map((appointment) => appointment.patient.uuid) || []);

  return {
    count: uniquePatientIds.size,
    error,
  };
};

export const useAppointmentsForDate = () => {
  const selectedDate = dayjs().startOf('day').format(omrsDateFormat);
  const url = `${restBaseUrl}/appointment/all?forDate=${encodeURIComponent(selectedDate)}`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: Array<Appointment> }, Error>(url, openmrsFetch);

  return {
    data,
    error,
    isLoading,
    isValidating,
  };
};
