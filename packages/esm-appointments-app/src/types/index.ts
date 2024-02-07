import { type OpenmrsResource } from '@openmrs/esm-framework';
import { type amPm } from '../helpers';

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
    identifiers: Array<Identifier>;
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
  durationMins?: number;
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

export interface Identifier {
  identifier: string;
  identifierName?: string;
}

export interface DailyAppointmentsCountByService {
  appointmentDate: string;
  services: Array<{
    serviceName: string;
    count: number;
  }>;
}

export interface RecurringPattern {
  type: 'DAY' | 'WEEK';
  period: number;
  endDate: string;
  daysOfWeek?: Array<string>; //'MONDAY' | 'TUESDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'>;
}

export interface RecurringAppointmentsPayload {
  appointmentRequest: AppointmentPayload;
  recurringPattern: RecurringPattern;
}
