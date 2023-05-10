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
  };
  providers: Array<Provider>;
  service: AppointmentService;
  startDateTime: string;
}

export const useAppointmentList = (appointmentStatus: string, startDate?: string) => {
  const appointmentDate = useAppointmentDate();
  const forDate = startDate ? startDate : appointmentDate;
  const url = `/ws/rest/v1/appointment/appointmentStatus?status=${appointmentStatus}&forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(
    appointmentStatus ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );
  const appointments = data?.data?.map((appointment) => ({
    name: appointment.patient.name,
    patientUuid: appointment.patient.uuid,
    identifier: appointment.patient?.identifier,
    dateTime: appointment.startDateTime,
    serviceType: appointment.service?.name,
    provider: appointment?.providers[0]?.['name'] ?? '',
    serviceTypeUuid: appointment?.service?.uuid,
    gender: appointment.patient?.gender,
    phoneNumber: appointment.patient?.phoneNumber,
    age: appointment.patient?.age,
  }));
  return { appointmentList: (appointments as Array<any>) ?? [], isLoading, error };
};

export const useEarlyAppointmentList = (startDate?: string) => {
  const appointmentDate = useAppointmentDate();
  const forDate = startDate ? startDate : appointmentDate;
  const url = `/ws/rest/v1/appointment/earlyAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const appointments = data?.data?.map((appointment) => ({
    name: appointment.patient.name,
    patientUuid: appointment.patient.uuid,
    identifier: appointment.patient?.identifier,
    dateTime: appointment.startDateTime,
    serviceType: appointment.service?.name,
    provider: appointment?.providers[0]?.['name'] ?? '',
    serviceTypeUuid: appointment.service.uuid,
    gender: appointment.patient?.gender,
    phoneNumber: appointment.patient?.phoneNumber,
    age: appointment.patient?.age,
  }));
  return { earlyAppointmentList: (appointments as Array<any>) ?? [], isLoading, error };
};

export const useCompletedAppointmentList = (startDate?: string) => {
  const appointmentDate = useAppointmentDate();
  const forDate = startDate ? startDate : appointmentDate;
  const url = `/ws/rest/v1/appointment/completedAppointment?forDate=${forDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentPatientList> }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });
  const appointments = data?.data?.map((appointment) => ({
    name: appointment.patient.name,
    patientUuid: appointment.patient.uuid,
    identifier: appointment.patient?.identifier,
    dateTime: appointment.startDateTime,
    serviceType: appointment.service?.name,
    provider: appointment?.providers[0]?.['name'] ?? '',
    serviceTypeUuid: appointment?.service?.uuid,
    gender: appointment.patient?.gender,
    phoneNumber: appointment.patient?.phoneNumber,
    age: appointment.patient?.age,
  }));
  return { completedAppointments: (appointments as Array<any>) ?? [], isLoading, error };
};
