import { type Visit, type OpenmrsResource, type Location } from '@openmrs/esm-framework';
import type React from 'react';

export enum SearchTypes {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  SEARCH_RESULTS = 'search_results',
  SCHEDULED_VISITS = 'scheduled-visits',
  VISIT_FORM = 'visit_form',
  QUEUE_SERVICE_FORM = 'queue_service_form',
  QUEUE_ROOM_FORM = 'queue_room_form',
}

export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
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
  patient: {
    uuid: string;
    name: string;
    identifier: string;
    gender: string;
    age: string;
    phoneNumber: string;
  };
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

export interface Order {
  uuid: string;
  dateActivated: string;
  dateStopped?: Date | null;
  dose: number;
  dosingInstructions: string | null;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderNumber: string;
  orderReason: string | null;
  orderReasonNonCoded: string | null;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  quantity: number;
  quantityUnits: OpenmrsResource;
}

export interface OrderItem {
  order: Order;
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
  orders: Array<Order>;
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

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitUuid?: string;
}

export interface FormattedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
}

export interface ObsMetaInfo {
  [_: string]: any;

  assessValue?: (value: number) => OBSERVATION_INTERPRETATION;
}

export type OBSERVATION_INTERPRETATION =
  | 'NORMAL'
  | 'HIGH'
  | 'CRITICALLY_HIGH'
  | 'OFF_SCALE_HIGH'
  | 'LOW'
  | 'CRITICALLY_LOW'
  | 'OFF_SCALE_LOW'
  | '--';

export interface PatientProgram {
  uuid: string;
  display: string;
  patient: OpenmrsResource;
  program: OpenmrsResource;
  dateEnrolled: string;
  dateCompleted: string;
  location: OpenmrsResource;
}

export interface AppointmentCountMap {
  allAppointmentsCount: number;
  missedAppointmentsCount;
  appointmentDate: number;
  appointmentServiceUuid: string;
}

export interface AppointmentSummary {
  appointmentService: { name: string };
  appointmentCountMap: Record<string, AppointmentCountMap>;
}

export interface QueueEntryPayload {
  visit: { uuid: string };
  queueEntry: {
    status: { uuid: string };
    priority: { uuid: string };
    queue: { uuid: string };
    patient: { uuid: string };
    startedAt: Date;
    sortWeight: number;
  };
}

export type AllowedPriority = OpenmrsResource;
export type AllowedStatus = OpenmrsResource;

// TODO: remove this in favor of Queue
export interface QueueServiceInfo {
  uuid: string;
  display: string;
  name: string;
  description: string;
  allowedPriorities: Array<AllowedPriority>;
  allowedStatuses: Array<AllowedStatus>;
}

export interface MappedServiceQueueEntry {
  id: string;
  name: string;
  age: string;
  gender: string;
  visitType: string;
  returnDate: string;
  patientUuid: string;
}

export enum FilterTypes {
  SHOW,
  HIDE,
}

export interface Provider {
  uuid: string;
  display: string;
  comments: string;
  response?: string;
  person: OpenmrsResource;
  location: string;
  serviceType: string;
}

export interface MappedQueueEntry {
  id: string;
  name: string;
  patientAge: string;
  patientSex: string;
  patientDob: string;
  patientUuid: string;
  queue: Queue;
  priority: Concept;
  priorityComment: string;
  status: Concept;
  visitType: string;
  visitUuid: string;
  waitTime: string;
  queueEntryUuid: string;
  queueLocation: string;
  sortWeight: string;
}

export interface EndVisitPayload {
  location: string;
  startDatetime: Date;
  visitType: string;
  stopDatetime: Date;
}

export interface LocationResponse {
  type: string;
  total: number;
  resourceType: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  id: string;
  entry: Array<LocationEntry>;
}

export interface LocationEntry {
  resource: Resource;
}

export interface Resource {
  id: string;
  name: string;
  resourceType: string;
  status: 'active' | 'inactive';
  meta?: {
    tag?: Array<{
      code: string;
      display: string;
      system: string;
    }>;
  };
}

export interface Identifer {
  identifier: string;
  display: string;
  uuid: string;
  identifierType: {
    uuid: string;
    display: string;
  };
}

export interface NewVisitPayload {
  uuid?: string;
  location: string;
  patient?: string;
  startDatetime: Date;
  visitType: string;
  stopDatetime?: Date;
  attributes?: Array<{
    attributeType: string;
    value: string;
  }>;
}

export interface QueueRoom {
  uuid: string;
  display: string;
  name: string;
  description: string;
}

export interface ProvidersQueueRoom {
  uuid: string;
  provider: {
    uuid: string;
    display: string;
  };
  queueRoom: {
    uuid: string;
    name: string;
    display: string;
  };
}

export interface WaitTime {
  metric: string;
  averageWaitTime: string;
}

export interface QueueTableCellComponentProps {
  queueEntry: QueueEntry;
}

export interface QueueTableColumn {
  headerI18nKey: string; // i18n key for the column header. Must be unique for each column in the queue table
  CellComponent: React.FC<QueueTableCellComponentProps>;

  // function to extract from the queue entry a searchable string representing the its value within this column.
  // May be null to make this column's content unsearchable
  getFilterableValue: (queueEntry: QueueEntry) => string | null;
}

export interface QueueTableTabConfig {
  columns: QueueTableColumn[];
  tabNameI18nKey?: string;
}

export interface Queue {
  uuid: string;
  display: string;
  name: string;
  description: string;
  location: Location;
  service: Concept;
  allowedPriorities: Array<Concept>;
  allowedStatuses: Array<Concept>;
}

export interface QueueEntry {
  uuid: string;
  display: string;
  endedAt: string;
  locationWaitingFor: Location;
  patient: Patient;
  priority: Concept;
  priorityComment: string | null;
  providerWaitingFor: Provider;
  queue: Queue;
  startedAt: string;
  status: Concept;
  visit: Visit;
  sortWeight: number;
  queueComingFrom: Queue;
  previousQueueEntry: QueueEntry;
}

export interface QueueEntrySearchCriteria {
  queue?: Array<string> | string;
  location?: Array<string> | string;
  service?: Array<string> | string;
  status?: Array<string> | string;
  isEnded: boolean;
}

// TODO: The follow types match the types from backend.
// They should be common enough to move to esm-core

export interface Concept extends OpenmrsResource {}

export interface Provider extends OpenmrsResource {}

export interface PatientIdentifierType extends OpenmrsResource {}

export interface Person {
  uuid: string;
  display: string;
  gender: string;
  age: number;
  birthdate: string;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: string;
  causeOfDeath: Concept;
  preferredName: PersonName;
  preferredAddress: PersonAddress;
  names: Array<PersonName>;
  addresses: Array<PersonAddress>;
  attributes: Array<Attribute>;
  birthtime: string;
  deathdateEstimated: boolean;
  causeOfDeathNonCoded: string;
}

export interface PersonName {
  uuid: string;
  display: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: string;
}

export interface PersonAddress {
  uuid: string;
  display: string;
  preferred: true;
  cityVillage: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  countyDistrict: string;
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  address5: string;
  address6: string;
  address7: string;
  address8: string;
  address9: string;
  address10: string;
  address11: string;
  address12: string;
  address13: string;
  address14: string;
  address15: string;
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: PatientIdentifier[];
  person: Person;
}

export interface PatientIdentifier {
  uuid: string;
  display: string;
  identifier: string;
  identifierType: PatientIdentifierType;
  location: Location;
  preferred: boolean;
}
