import useSWR from 'swr';
import { openmrsFetch, formatDate, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '../../../../__mocks__/appointments.mock';
import { AppointmentsFetchResponse } from '../types';

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
