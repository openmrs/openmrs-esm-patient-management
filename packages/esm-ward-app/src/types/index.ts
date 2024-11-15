import type {
  Concept,
  DefaultWorkspaceProps,
  Location,
  OpenmrsResource,
  OpenmrsResourceStrict,
  Patient,
  Person,
  Visit,
} from '@openmrs/esm-framework';
import type React from 'react';
import type { useWardPatientGrouping } from '../hooks/useWardPatientGrouping';

interface WardPatientCardProps {
  wardPatient: WardPatient;
}

export type WardPatientCardType = React.FC<WardPatientCardProps>;

// WardPatient is a patient admitted to a ward, and/or in a bed on a ward
export type WardPatient = {
  /**
   * The patient and their current visit. These values are taken either
   * from either the inpatientAdmission object, the inpatientRequest object
   * or the admissionLocation object (which contains the bed)
   */
  patient: Patient;
  visit: Visit;

  /**
   * the bed assigned to the patient. This object is only set if the patient
   * has a bed assigned
   */
  bed: Bed;

  /**
   * The admission detail. This object is only set if the patient has been
   * admitted to the ward
   */
  inpatientAdmission: InpatientAdmission;

  /**
   * The admission request. The object is only set if the patient has a
   * pending admission / transfer request.
   */
  inpatientRequest: InpatientRequest;
};

export interface WardPatientWorkspaceProps extends DefaultWorkspaceProps {
  wardPatient: WardPatient;
  WardPatientHeader: WardPatientCardType;
}

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

export interface BedDetail {
  bedId: number;
  bedNumber: number;
  bedType: BedType;
  physicalLocation: Location;
  patients: Array<Patient>;
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

  // the current in patient request
  currentInpatientRequest: InpatientRequest;
}

export interface MotherAndChild {
  mother: Patient;
  child: Patient;
  motherAdmission: InpatientAdmission;
  childAdmission: InpatientAdmission;
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

export interface WardMetrics {
  patients: string;
  freeBeds: string;
  capacity: string;
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
  concept: Concept | string;
  value?: string | OpenmrsResource;
  groupMembers?: Array<ObsPayload>;
}

export type WardPatientGroupDetails = ReturnType<typeof useWardPatientGrouping>;
export interface WardViewContext {
  wardPatientGroupDetails: WardPatientGroupDetails;
  WardPatientHeader: WardPatientCardType;
}

export interface PatientAndAdmission {
  patient: Patient;
  currentAdmission: InpatientAdmission;
}

export interface MotherChildRelationships {
  motherByChildUuid: Map<string, PatientAndAdmission>;
  childrenByMotherUuid: Map<string, PatientAndAdmission[]>;
  isLoading: boolean;
}

export interface MaternalWardViewContext {
  motherChildRelationships: MotherChildRelationships;
}

export type PatientWorkspaceAdditionalProps = Omit<WardPatientWorkspaceProps, keyof DefaultWorkspaceProps>;
