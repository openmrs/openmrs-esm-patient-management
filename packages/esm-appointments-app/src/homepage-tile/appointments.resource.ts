import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import dayjs from 'dayjs';

const useAppointmentsData = () => {
  const appointmentDate = dayjs(new Date().setHours(0, 0, 0, 0)).toISOString();

  const url = `${restBaseUrl}/appointment/all?forDate=${appointmentDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<any> }>(url, openmrsFetch);

  return { data: data?.data, error, isLoading };
};

export default useAppointmentsData;
