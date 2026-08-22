import type { Link, OpenmrsResource, OpenmrsResourceStrict, Person } from '@openmrs/esm-framework';

export enum PatientListType {
  STARRED = 'Starred',
  SYSTEM = 'System list',
  USER = 'My list',
  ALL = 'All',
}

export interface CohortLocation {
  uuid: string;
  display: string;
}

export interface AddablePatientListViewModel {
  addPatient(): Promise<void>;
  displayName: string;
  id: string;
  checked?: boolean;
}

export interface PatientList {
  id: string;
  display: string;
  description: string;
  type: string;
  location: CohortLocation | null;
  size: number;
  options?: Array<PatientListOption>;
}

export interface PatientListUpdate {
  isStarred: boolean;
}

export interface PatientListFilter {
  isStarred?: boolean;
  name?: string;
  type?: PatientListType;
  label?: string;
}

export interface PatientListOption {
  type: string;
  name: string;
  value: string | number | boolean;
}

export interface PatientListMember {
  endDate: string | number | Date;
  id: string;
}

export interface PatientListPatient {
  name: string;
  identifier: string;
  sex: string;
  startDate: string;
  uuid: string;
  membershipUuid?: string;
  mobile?: string | null;
}

export interface PatientIdentifier extends OpenmrsResourceStrict {
  identifier: string;
}

export interface CohortMemberPatient extends OpenmrsResourceStrict {
  identifiers: Array<PatientIdentifier>;
  person: Person;
}

export interface AddPatientData {
  patient: string;
  cohort: string;
  startDate: string;
}

export interface OpenmrsCohort {
  uuid: string;
  resourceVersion: string;
  name: string;
  description: string;
  attributes: Array<OpenmrsResource>;
  links: Array<Link>;
  location: CohortLocation | null;
  groupCohort: boolean | null;
  startDate: string | null;
  endDate: string | null;
  voidReason: string | null;
  voided: boolean;
  size: number;
  isStarred?: boolean;
  type?: string;
  cohortType?: CohortType;
}

export interface OpenmrsCohortRef {
  cohort: OpenmrsCohortMember;
}

export interface OpenmrsCohortMember {
  attributes: Array<OpenmrsResource>;
  description: string;
  endDate: string;
  startDate: string;
  name: string;
  uuid: string;
  patient: CohortMemberPatient;
  voided: boolean;
}

export interface CohortResponse<T> {
  results: Array<T>;
  error: Error | null;
  totalCount: number;
}

export interface NewCohortData {
  name: string;
  description: string;
  cohortType: string;
}

export interface NewCohortDataPayload {
  name: string;
  description: string;
  cohortType: string;
  location: string;
}

export interface CohortType {
  display: string;
  uuid: string;
}
