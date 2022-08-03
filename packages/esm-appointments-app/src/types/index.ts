import { OpenmrsResource } from '@openmrs/esm-framework';
import { string } from 'yup';

export enum SearchTypes {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  SEARCH_RESULTS = 'search_results',
  SCHEDULED_VISITS = 'scheduled-visits',
}

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

export interface Appointment {
  appointmentKind: string;
  appointmentNumber: string;
  comments: string;
  endDateTime: Date | number;
  location: OpenmrsResource;
  patient: {
    identifer: string;
    name: string;
    uuid: string;
    age: string;
    dob: string;
    birthDate: string;
    gender: string;
    contact: string;
  };
  provider: OpenmrsResource;
  providers: Array<OpenmrsResource>;
  recurring: boolean;
  service: AppointmentService;
  startDateTime: string;
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

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}

export interface MappedAppointment {
  id: string;
  name: string;
  age: string;
  gender: string;
  phoneNumber: string;
  dob: string;
  patientUuid: string;
  dateTime: string;
  serviceType: string;
  serviceUuid: string;
  appointmentKind: string;
  provider: string;
  location: string;
  comments: string;
  status: string;
  appointmentNumber: string;
}

export interface AppointmentPayload {
  providerUuid: string;
  patientUuid: string;
  serviceUuid: string;
  startDateTime: string;
  endDateTime: string;
  appointmentKind: string;
  providers?: Array<{ uuid: string; comments: string; response?: string }>;
  locationUuid: string;
  comments: string;
  status: string;
  appointmentNumber: string;
  uuid: string;
}
