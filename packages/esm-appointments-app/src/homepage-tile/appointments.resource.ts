import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import dayjs from 'dayjs';
import type { Appointment } from '../types';

const useAppointmentsData = () => {
  const appointmentDate = dayjs(new Date().setHours(0, 0, 0, 0)).toISOString();

  const url = `${restBaseUrl}/appointment/all?forDate=${appointmentDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<Appointment> }>(url, openmrsFetch);

  return { data: data?.data, error, isLoading };
};

export default useAppointmentsData;
