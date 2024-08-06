import type {
  Concept,
  Location,
  OpenmrsResource,
  OpenmrsResourceStrict,
  Patient,
  Person,
  Visit,
} from '@openmrs/esm-framework';
import type React from 'react';

export type WardPatientCardRow = React.FC<WardPatient>;
export type WardPatientCardElement = React.FC<WardPatient>;

// WardPatient is a patient admitted to a ward, and/or in a bed on a ward
export type WardPatient = {
  patient: Patient;
  visit: Visit;
  bed?: Bed;
  admitted: boolean;
  encounterAssigningToCurrentInpatientLocation: Encounter;
  firstAdmissionOrTransferEncounter: Encounter;
};

// server-side types defined in openmrs-module-bedmanagement:

// note "AdmissionLocationResponse" isn't the clearest name, but it matches the endpoint; endpoint fetches bed information (including info about patients in those beds) for a location (as provided by the bed management module)
export interface AdmissionLocationFetchResponse {
  totalBeds: number;
  occupiedBeds: number;
  ward: Location;
  bedLayouts: Array<BedLayout>;
}

export interface Bed {
  id: number;
  uuid: string;
  bedNumber: string;
  bedType: BedType;
  row: number;
  column: number;
  status: BedStatus;
}

export interface BedLayout {
  rowNumber: number;
  columnNumber: number;
  bedNumber: string;
  bedId: number;
  bedUuid: string;
  status: BedStatus;
  bedType: BedType;
  location: string;
  patients: Patient[];
  bedTagMaps: BedTagMap[];
}

export interface BedType {
  uuid: string;
  name: string;
  displayName: string;
  description: string;
  resourceVersion: string;
}

interface BedTagMap {
  uuid: string;
  bedTag: {
    id: number;
    name: string;
    uuid: string;
    resourceVersion: string;
  };
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED';

// GET /rest/emrapi/inpatient/request
export interface InpatientRequestFetchResponse {
  results: InpatientRequest[];
}

export interface InpatientRequest {
  patient: Patient;
  dispositionType: DispositionType;
  disposition: Concept;
  dispositionEncounter?: Encounter;
  dispositionObsGroup?: Observation;
  dispositionLocation?: Location;
  visit: Visit;
}

export type DispositionType = 'ADMIT' | 'TRANSFER' | 'DISCHARGE';

// GET /rest/emrapi/inpatient/visits
export interface InpatientAdmissionFetchResponse {
  results: InpatientAdmission[];
}

export interface InpatientAdmission {
  patient: Patient;
  visit: Visit;

  // the encounter of type "Admission" or "Transfer" that is responsible
  // for assigning the patient to the current inpatient location. For example,
  // if the patient has been admitted /transferred to multiple locations as follows:
  // A -> B -> A
  // then encounterAssigningToCurrentInpatientLocation
  // would be the transfer encounter that lands the patient back to A.
  encounterAssigningToCurrentInpatientLocation: Encounter;

  // the first encounter of the visit that is of encounterType "Admission" or "Transfer",
  // regardless of the admission location
  firstAdmissionOrTransferEncounter: Encounter;
}

// TODO: Move these types to esm-core
export interface Observation extends OpenmrsResourceStrict {
  concept: OpenmrsResource;
  person: Person;
  obsDatetime: string;
  accessionNumber: string;
  obsGroup: Observation;
  value: number | string | boolean | OpenmrsResource;
  valueCodedName: OpenmrsResource; // ConceptName
  groupMembers: Array<Observation>;
  comment: string;
  location: Location;
  order: OpenmrsResource; // Order
  encounter: Encounter;
  voided: boolean;
}

export interface Encounter extends OpenmrsResourceStrict {
  encounterDatetime?: string;
  patient?: Patient;
  location?: Location;
  form?: OpenmrsResource;
  encounterType?: EncounterType;
  obs?: Array<Observation>;
  orders?: any;
  voided?: boolean;
  visit?: Visit;
  encounterProviders?: Array<EncounterProvider>;
  diagnoses?: any;
}

export interface EncounterProvider extends OpenmrsResourceStrict {
  provider?: OpenmrsResource;
  encounterRole?: EncounterRole;
  voided?: boolean;
}

export interface EncounterType extends OpenmrsResourceStrict {
  name?: string;
  description?: string;
  retired?: boolean;
}

export interface EncounterRole extends OpenmrsResourceStrict {
  name?: string;
  description?: string;
  retired?: boolean;
}

export interface EncounterPayload {
  encounterDatetime?: string;
  encounterType: string;
  patient: string;
  location: string;
  encounterProviders?: Array<{ encounterRole: string; provider: string }>;
  obs: Array<ObsPayload>;
  form?: string;
  orders?: Array<any>;
  visit?: string;
}

export interface ObsPayload {
  concept: Concept;
  value?: string;
  groupMembers?: Array<{
    concept: Concept;
    value: string;
  }>;
}
