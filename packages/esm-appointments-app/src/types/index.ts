import { OpenmrsResource } from '@openmrs/esm-framework';
import { amPm } from '../helpers';

export enum SearchTypes {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  SEARCH_RESULTS = 'search_results',
  SCHEDULED_VISITS = 'scheduled-visits',
}

export interface Appointment {
  appointmentKind: string;
  appointmentNumber: string;
  comments: string;
  endDateTime: Date | number | any;
  location: OpenmrsResource;
  patient: {
    identifier: string;
    name: string;
    uuid: string;
    age?: string;
    dob?: string;
    birthDate?: string;
    gender?: string;
    phoneNumber?: string;
  };
  provider: OpenmrsResource;
  providers: Array<OpenmrsResource>;
  recurring: boolean;
  service: AppointmentService;
  startDateTime: string | any;
  status: string;
  uuid: string;
  additionalInfo?: string | null;
  serviceTypes?: Array<ServiceTypes> | null;
  voided: boolean;
  extensions: {};
  teleconsultationLink: string | null;
}

export interface AppointmentsFetchResponse {
  data: Array<Appointment>;
}
export interface AppointmentService {
  appointmentServiceId: number;
  creatorName: string;
  description: string;
  durationMins?: string | null;
  endTime: string;
  initialAppointmentStatus: string;
  location?: OpenmrsResource;
  maxAppointmentsLimit: number | null;
  name: string;
  specialityUuid?: OpenmrsResource | {};
  startTime: string;
  uuid: string;
  serviceTypes?: Array<ServiceTypes>;
  color?: string;
  startTimeTimeFormat?: amPm;
  endTimeTimeFormat?: amPm;
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
  serviceTypeUuid?: string;
  appointmentKind: string;
  provider: string;
  location: string;
  comments: string;
  status: string;
  appointmentNumber: string;
  recurring?: boolean;
  uuid?: string;
  providers?: Array<OpenmrsResource>;
  identifier?: string;
}

export interface MappedHomeAppointment {
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
  recurring?: boolean;
  uuid?: string;
  serviceColor?: string;
  duration?: string;
  identifier?: string;
}
export interface AppointmentPayload {
  patientUuid: string;
  serviceUuid: string;
  startDateTime: string;
  endDateTime: string;
  appointmentKind: string;
  providers?: Array<OpenmrsResource>;
  locationUuid: string;
  comments: string;
  status?: string;
  appointmentNumber?: string;
  uuid?: string;
  providerUuid?: string | OpenmrsResource;
}
export interface AppointmentCountMap {
  allAppointmentsCount: number;
  missedAppointmentsCount;
  appointmentDate: number;
  appointmentServiceUuid: string;
}

export interface AppointmentSummary {
  appointmentService: OpenmrsResource;
  appointmentCountMap: Record<string, AppointmentCountMap>;
}
export interface Provider {
  uuid: string;
  display: string;
  comments: string;
  response?: string;
  person: OpenmrsResource;
  name?: string;
}

export enum DurationPeriod {
  monthly,
  weekly,
  daily,
}

export enum AppointmentTypes {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
  CHECKEDIN = 'checkedin',
  COMPLETED = 'completed',
}

export type CalendarType = 'daily' | 'weekly' | 'monthly';
