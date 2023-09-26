import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentService, Provider } from '../types';
import { useAppointmentDate } from '../helpers';

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
    identifier: string;
    identifiers: Array<{ identifierName: string; identifier: string }>;
  };
  providers: Array<Provider>;
  service: AppointmentService;
  startDateTime: string;
  status: string;
}

export const useAppointmentList = (appointmentStatus: string, startDate?: string, identifierType?: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const forDate = startDate ? startDate : currentAppointmentDate;
  const url = `/ws/rest/v1/appointment/appointmentStatus?status=${appointmentStatus}&forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(
    appointmentStatus ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );

  const appointments = data?.data?.map((appointment) => toAppointmentObject(appointment, identifierType));
  return { appointmentList: (appointments as Array<any>) ?? [], isLoading, error };
};

export const useScheduledAppointments = (startDate?: string, identifierType?: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const forDate = startDate ? startDate : currentAppointmentDate;
  const url = `/ws/rest/v1/appointments?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const appointments = data?.data
    ?.filter(({ status }) => status === 'Scheduled')
    .map((appointment) => toAppointmentObject(appointment, identifierType));
  return { scheduledAppointments: (appointments as Array<any>) ?? [], isLoading, error };
};

export const useEarlyAppointmentList = (startDate?: string, identifierType?: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const forDate = startDate ? startDate : currentAppointmentDate;
  const url = `/ws/rest/v1/appointment/earlyAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const appointments = data?.data?.map((appointment) => toAppointmentObject(appointment, identifierType));
  return { earlyAppointmentList: (appointments as Array<any>) ?? [], isLoading, error };
};

export const useCompletedAppointmentList = (startDate?: string, identifierType?: string) => {
  const { currentAppointmentDate } = useAppointmentDate();
  const forDate = startDate ? startDate : currentAppointmentDate;
  const url = `/ws/rest/v1/appointment/completedAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const appointments = data?.data?.map((appointment) => toAppointmentObject(appointment, identifierType));
  return { completedAppointments: (appointments as Array<any>) ?? [], isLoading, error };
};

function toAppointmentObject(appointment: AppointmentPatientList, identifierType: string) {
  const identifier = appointment.patient.identifiers
    ? appointment.patient.identifiers.find((identifier) => identifier.identifierName === identifierType).identifier
    : appointment.patient.identifier;
  return {
    name: appointment.patient.name,
    patientUuid: appointment.patient.uuid,
    identifier: identifier,
    dateTime: appointment.startDateTime,
    serviceType: appointment.service?.name,
    provider: appointment?.providers[0]?.['name'] ?? '',
    serviceTypeUuid: appointment?.service?.uuid,
    gender: appointment.patient?.gender,
    phoneNumber: appointment.patient?.phoneNumber,
    age: appointment.patient?.age,
  };
}
