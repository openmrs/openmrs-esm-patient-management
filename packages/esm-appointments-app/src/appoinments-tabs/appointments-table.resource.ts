import useSWR from 'swr';
import { openmrsFetch, formatDate, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '../../../../__mocks__/appointments.mock';
import { AppointmentsFetchResponse, AppointmentPayload } from '../types';

export function useAppointments() {
  const apiUrl = `/ws/rest/v1/appointments?v=full`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<AppointmentsFetchResponse> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

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

  const appointmentEntries = mockAppointmentsData.data?.map(mappedAppointment);

  return {
    appointments: appointmentEntries ? appointmentEntries : null,
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

export function usePatient(uuid: string) {
  const apiUrl = `/ws/rest/v1/patient/${uuid}`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<fhir.Patient> } }, Error>(apiUrl, openmrsFetch);

  return {
    patient: data ? data.data : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
