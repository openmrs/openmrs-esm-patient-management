import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { FetchResponse, openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '../../__mocks__/appointments.mock';

interface ObsData {
  concept: {
    display: string;
    uuid: string;
  };
  value?: string | any;
  groupMembers?: Array<{
    concept: { uuid: string; display: string };
    value?: string | any;
  }>;
  obsDatetime: string;
}

interface Encounter {
  diagnoses: Array<any>;
  encounterDatetime: string;
  encounterProviders?: Array<{ provider: { person: { display: string } } }>;
  encounterType: { display: string; uuid: string };
  obs: Array<ObsData>;
  uuid: string;
  voided: boolean;
}

export interface AppointmentsFetchResponse {
  data: Array<Appointment>;
}

export interface Appointment {
  appointmentKind: string;
  appointmentNumber: string;
  comments: string;
  endDateTime: Date | number;
  location: OpenmrsResource;
  patient: fhir.Patient;
  provider: OpenmrsResource;
  providers: Array<OpenmrsResource>;
  recurring: boolean;
  service: AppointmentService;
  startDateTime: number | any;
  status: string;
  uuid: string;
}

export interface AppointmentService {
  appointmentServiceId: number;
  creatorName: string;
  description: string;
  durationMins: string;
  endTime: string;
  initialAppointmentStatus: string;
  location: OpenmrsResource;
  maxAppointmentsLimit: number | null;
  name: string;
  speciality: OpenmrsResource;
  startTime: string;
  uuid: string;
  serviceTypes: Array<ServiceTypes>;
}

export interface ServiceTypes {
  duration: number;
  name: string;
  uuid: string;
}

interface MappedEncounter extends Omit<Encounter, 'encounterType' | 'provider'> {
  encounterType: string;
  provider: string;
}

export function useAppointmentEntries() {
  const apiUrl = `/ws/rest/v1/appointments?v=full`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<AppointmentsFetchResponse> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  // const mapAppointmentProperties = (appointment: Appointment): MappedEncounter => ({
  const mapAppointmentProperties = (appointment) => ({
    id: appointment.uuid,
    name: appointment.patient.name,
    patientUuid: appointment.patient.uuid,
    dateTime: appointment.startDateTime,
    serviceType: appointment.serviceType ? appointment.serviceType.display : '--',
    provider: appointment.provider ? appointment.provider.person.display : '--',
    location: appointment.location ? appointment.location.name : '--',
  });

  const mappedAppointmentEntries = mockAppointmentsData.data?.map(mapAppointmentProperties);

  return {
    appointmentEntries: mappedAppointmentEntries ? mappedAppointmentEntries : null,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}
