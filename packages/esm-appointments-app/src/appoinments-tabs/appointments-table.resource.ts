import useSWR from 'swr';
import { openmrsFetch, formatDate, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { AppointmentsFetchResponse, AppointmentPayload, AppointmentService } from '../types';

export function useAppointments() {
  const apiUrl = `/ws/rest/v1/appointment/all`;
  const { data, error, isValidating } = useSWR<{ data: Array<AppointmentsFetchResponse> }, Error>(apiUrl, openmrsFetch);

  const mappedAppointment = (appointment) => ({
    id: appointment.uuid,
    name: appointment.patient.name,
    age: appointment.patient.age,
    gender: appointment.patient.gender,
    phoneNumber: appointment.patient.phoneNumber,
    dob: formatDate(parseDate(appointment.patient.birthdate), { mode: 'wide' }),
    patientUuid: appointment.patient.uuid,
    dateTime: formatDatetime(parseDate(appointment.startDateTime)),
    serviceType: appointment.serviceType ? appointment.serviceType.display : '--',
    visitType: appointment.serviceType ? appointment.serviceType.display : '--',
    provider: appointment.provider ? appointment.provider.person.display : '--',
    location: appointment.location ? appointment.location.name : '--',
    comments: appointment.comments ? appointment.comments : '--',
  });

  const appointmentEntries = data?.data?.map(mappedAppointment);

  return {
    appointments: appointmentEntries ? appointmentEntries : [],
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export function editAppointment(appointment: AppointmentPayload, abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appointment`, {
    method: 'POST',
    signal: abortController.signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: appointment,
  });
}

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function useServices() {
  const apiUrl = `/ws/rest/v1/appointmentService/all/default`;
  const { data, error, isValidating } = useSWR<{ data: Array<AppointmentService> }, Error>(apiUrl, openmrsFetch);

  return {
    services: data ? data.data : [],
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
