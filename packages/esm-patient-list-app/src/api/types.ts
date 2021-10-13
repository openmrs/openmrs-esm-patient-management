export enum PatientListType {
  SYSTEM,
  USER,
}

export interface PatientList {
  id: string;
  display: string;
  description: string;
  type: PatientListType;
  size: number;
  isStarred: boolean;
  options?: Array<PatientListOption>;
}

export interface PatientListUpdate {
  isStarred: boolean;
}

export interface PatientListFilter {
  isStarred?: boolean;
  name?: string;
  type?: PatientListType;
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
}

export interface OpenmrsCohortRef {
  cohort: OpenmrsCohortMember;
}

export interface OpenmrsCohortMember {
  attributes: Array<any>;
  description: string;
  endDate: string;
  name: string;
  uuid: string;
  patient: {
    uuid: string;
  };
}

export interface CohortResponse<T> {
  results: Array<T>;
  error: any;
}

export interface NewCohortData {
  name: string;
  description: string;
}
