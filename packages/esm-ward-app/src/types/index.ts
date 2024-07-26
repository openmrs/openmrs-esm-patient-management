import type {
  OpenmrsResource,
  OpenmrsResourceStrict,
  Person,
  Visit,
  Location,
  Patient,
  Concept,
} from '@openmrs/esm-framework';
import type React from 'react';

export interface WardPatientCardProps {
  patient: Patient;
  visit: Visit;
  bed?: Bed;
}

export type WardPatientCardRow = React.FC<WardPatientCardProps>;
export type WardPatientCardElement = React.FC<WardPatientCardProps>;

export const patientCardElementTypes = [
  'bed-number',
  'patient-name',
  'patient-age',
  'patient-address',
  'patient-obs',
  'patient-coded-obs-tags',
  'admission-time',
  'patient-identifier',
] as const;
export type PatientCardElementType = (typeof patientCardElementTypes)[number];

// a Ward Patient can either be a patient that is already admitted or a
// patient that is awaiting admission
export type WardPatient = (AdmittedPatient & { admitted: true }) | (InpatientRequestOld & { admitted: false });

// server-side types defined in openmrs-module-bedmanagement:

export interface AdmissionLocation {
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
}

export type DispositionType = 'ADMIT' | 'TRANSFER' | 'DISCHARGE';

// InpatientRequestOld[] returned by:
//    GET /rest/emrapi/inpatient/visits
// It is also returned by the following endpoints which have been deprecated:
//    GET /rest/emrapi/inpatient/admissionRequests
//    GET /rest/emrapi/inpatient/transferRequests
//    GET /rest/emrapi/inpatient/admissionAndTransferRequests
/**
 * @deprecated
 */
export interface InpatientRequestOld {
  patient: Patient;
  visit: Visit;
  type: DispositionTypeOld;

  // as of now, these fields are not included in the backend
  encounter?: Encounter;
  dispositionObs?: Observation;
  dispositionLocation?: Location;
  dispositionDate?: Date;
}

/**
 * @deprecated
 */
export type DispositionTypeOld = 'ADMISSION' | 'TRANSFER' | 'DISCHARGE';

// AdmittedPatient[] returned by:
// GET /rest/emrapi/inpatient/visits
export interface AdmittedPatient {
  patient: Patient;
  visit: Visit;
  currentLocation: Location;
  timeSinceAdmissionInMinutes: number;
  timeAtInpatientLocationInMinutes: number;
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
