import { OpenmrsResource } from '@openmrs/esm-framework';

export enum SearchTypes {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  SEARCH_RESULTS = 'search_results',
  SCHEDULED_VISITS = 'scheduled-visits',
  VISIT_FORM = 'visit_form',
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Array<any>;
  person: Person;
}

export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
}

export interface Person {
  age: number;
  attributes: Array<Attribute>;
  birthDate: string;
  gender: string;
  display: string;
  preferredAddress: OpenmrsResource;
  uuid: string;
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
  // recurring: boolean;
  service: AppointmentService;
  startDateTime: number | any;
  status: string;
  uuid: string;
}

export interface ServiceTypes {
  duration: number;
  name: string;
  uuid: string;
}

export interface AppointmentService {
  appointmentServiceId: number;
  color: string;
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

export interface Note {
  concept: OpenmrsResource;
  note: string;
  provider: {
    name: string;
    role: string;
  };
  time: string;
}

export interface DiagnosisItem {
  diagnosis: string;
}

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: Array<Observation>;
  form: OpenmrsResource;
  patient: OpenmrsResource;
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

export interface PatientVitals {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  oxygenSaturation?: number;
  height?: number;
  weight?: number;
  bmi?: number | null;
  respiratoryRate?: number;
  muac?: number;
  provider?: {
    name: string;
    role: string;
  };
  time?: string;
}
