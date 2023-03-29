import { OpenmrsResource } from '@openmrs/esm-api';

export enum PatientListType {
  STARRED = 'Starred',
  SYSTEM = 'System list',
  USER = 'My list',
  ALL = 'All',
}

export interface PatientList {
  id: string;
  display: string;
  description: string;
  type: string;
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
  value: any;
}

export interface PatientListMember {
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
  attributes: Array<any>;
  links: Array<any>;
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
  attributes: Array<any>;
  description: string;
  endDate: string;
  startDate: string;
  name: string;
  uuid: string;
  patient: OpenmrsResource;
}

export interface CohortResponse<T> {
  results: Array<T>;
  error: any;
  totalCount: number;
}

export interface NewCohortData {
  name: string;
  description: string;
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
