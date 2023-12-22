import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useAppointmentDate } from '../helpers';
import { type Identifier } from '../types';
import { configSchema } from '../config-schema';

export interface Response {
  age: number;
  dob: number;
  gender: string;
  identifiers: Array<Identifier>;
  name: string;
  uuid: string;
  phoneNumber: string;
  visit: {
    stopDateTime: Date;
    startDateTime: Date;
    visitType: string;
  };
}

export function useUnscheduledAppointments() {
  const { currentAppointmentDate } = useAppointmentDate();
  const url = `/ws/rest/v1/appointment/unScheduledAppointment?forDate=${currentAppointmentDate}`;
  const { data, error, isLoading } = useSWR<{ data: Array<Response> }>(url, openmrsFetch, { errorRetryCount: 2 });
  const appointments = data?.data?.map((appointment) => toAppointmentObject(appointment));

  return { isLoading, data: appointments ?? [], error };
}

function toAppointmentObject(appointment: Response) {
  return {
    name: appointment.name,
    identifier: appointment?.identifiers?.find(
      (identifier) => identifier.identifierName === configSchema.patientIdentifierType._default,
    ).identifier,
    dateTime: appointment?.visit.startDateTime,
    gender: appointment.gender,
    phoneNumber: appointment.phoneNumber,
    age: appointment.age,
    uuid: appointment.uuid,
  };
}
