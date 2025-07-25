import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import useSWR from 'swr';
import { type Appointment } from '../types';
import dayjs from 'dayjs';

export const useUniquePatientsWithAppointmentsCount = (locationUuid?: string) => {
  const { appointments, error } = useAppointmentsForDate();

  const filteredAppointments = locationUuid
    ? appointments?.data?.filter((appt) => appt.location?.uuid === locationUuid && appt?.status !== 'Cancelled')
    : appointments?.data?.filter((appt) => appt.status !== 'Cancelled');

  const uniquePatientIds = new Set(filteredAppointments?.map((appointment) => appointment.patient.uuid) || []);

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
    appointments: data,
    error,
    isLoading,
    isValidating,
  };
};
