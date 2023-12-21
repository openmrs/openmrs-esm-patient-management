import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { type AppointmentService, type Identifier, type Provider } from '../types';
import { useAppointmentDate } from '../helpers';
import dayjs from 'dayjs';
import { configSchema } from '../config-schema';

interface AppointmentPatientList {
  uuid: string;
  appointmentNumber: number;
  patient: {
    phoneNumber: string;
    gender: string;
    dob: number;
    name: string;
    uuid: string;
    age: number;
    identifiers?: Array<Identifier>;
  };
  providers: Array<Provider>;
  service: AppointmentService;
  startDateTime: string;
  identifier: string;
}

export const useAppointmentList = (appointmentStatus: string, date?: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const startDate = date ? date : currentAppointmentDate;
  const endDate = dayjs(startDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZZ'); // TODO: fix? is this correct?
  const searchUrl = `/ws/rest/v1/appointments/search`;
  const abortController = new AbortController();

  const fetcher = ([url, startDate, endDate, status]) =>
    openmrsFetch(url, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        startDate: startDate,
        endDate: endDate,
        status: status,
      },
    });

  const { data, error, isLoading, mutate } = useSWR<{ data: Array<AppointmentPatientList> }>(
    [searchUrl, startDate, endDate, appointmentStatus],
    fetcher,
    { errorRetryCount: 2 },
  );

  const appointments = data?.data?.map((appointment) => toAppointmentObject(appointment));
  return { appointmentList: (appointments as Array<any>) ?? [], isLoading, error, mutate };
};

export const useEarlyAppointmentList = (startDate?: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const forDate = startDate ? startDate : currentAppointmentDate;
  const url = `/ws/rest/v1/appointment/earlyAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const appointments = data?.data?.map((appointment) => toAppointmentObject(appointment));
  return { earlyAppointmentList: (appointments as Array<any>) ?? [], isLoading, error };
};

function toAppointmentObject(appointment: AppointmentPatientList) {
  return {
    name: appointment.patient.name,
    patientUuid: appointment.patient.uuid,
    identifier: appointment?.patient?.identifiers?.find(
      (identifier) => identifier.identifierName === configSchema.patientIdentifierType._default,
    ).identifier,
    dateTime: appointment.startDateTime,
    serviceType: appointment.service?.name,
    provider: appointment?.providers[0]?.['name'] ?? '',
    serviceTypeUuid: appointment?.service?.uuid,
    gender: appointment.patient?.gender,
    phoneNumber: appointment.patient?.phoneNumber,
    age: appointment.patient?.age,
    uuid: appointment.uuid,
  };
}
