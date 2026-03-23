import type { OpenmrsResource } from '@openmrs/esm-framework';
import type { ErrorObject } from './patient-list.resource';

export enum PatientListType {
  STARRED = 'Starred',
  SYSTEM = 'System list',
  USER = 'My list',
  ALL = 'All',
}

export interface AddablePatientListViewModel {
  addPatient(): Promise<void>;
  displayName: string;
  checked?: boolean;
  id: string;
}

export interface PatientList {
  id: string;
  display: string;
  description: string;
  type: string;
  location: { uuid: string; display: string } | null;
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
  links: Array<{ rel: string; uri: string; resourceAlias?: string }>;
  location: Location | null;
  groupCohort: boolean | null;
  startDate: string | null;
  endDate: string | null;
  voidReason: string | null;
  voided: boolean;
  isStarred?: boolean;
  type?: string;
  size: number;
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
  patient: OpenmrsResource;
  voided: boolean;
}

export interface CohortResponse<T> {
  results: Array<T>;
  error: ErrorObject | null;
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
