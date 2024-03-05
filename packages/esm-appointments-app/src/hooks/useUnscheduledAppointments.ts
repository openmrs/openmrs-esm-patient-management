import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Identifier } from '../types';
import { configSchema } from '../config-schema';
import SelectedDateContext from './selectedDateContext';
import { useContext } from 'react';

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
  const { selectedDate } = useContext(SelectedDateContext);
  // TODO/NOTE: this endpoint is not implemented in main Bahmni Appointments backend
  const url = `${restBaseUrl}/appointment/unScheduledAppointment?forDate=${selectedDate}`;
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
