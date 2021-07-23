import { OpenmrsCohort } from './api';

/**
 * A regular {@link OpenmrsCohort} enhanced with additional attributes required by the frontend.
 */
export interface EnrichedCohort extends OpenmrsCohort {
  /**
   * The cohort's ID.
   * This an an alias for {@link OpenmrsCohort.uuid} and required for data tables.
   */
  id: string;
  /**
   * Whether the cohort only exists locally (e.g. in the case of the offline patient list which
   * is not tracked by the backend).
   */
  isLocal: boolean;
}

export enum PATIENT_LIST_TYPE {
  SYSTEM,
  USER,
}

export interface PatientListBase {
  display: string;
  uuid: string;
  description: string;
  type: PATIENT_LIST_TYPE;
  memberCount: number;
  isStarred: boolean;
}

export interface PatientListDetails extends PatientListBase {
  options?: Array<PatientListOption>;
}

export interface PatientListOption {
  type: string;
  name: string;
  value: any;
}

/**
 * identifier -> uuid
 * age
 * gender
 * date of birth
 * last visit -> last visit/encounter date
 */
export interface PatientListMember {
  patientUuid: string;
  properties: Array<PatientListMemberProperty>;
}

export interface PatientListMemberProperty {
  type: string;
  value: string | number;
}

export interface PatientListMemberFilter {
  // ??
}

export interface LoadingState {
  loading: true;
  data: undefined;
  error: undefined;
}

export interface DataState<T> {
  loading: false;
  data: T;
  error: undefined;
}

export interface ErrorState {
  loading: false;
  data: undefined;
  error: Error;
}

export type FetchState<T> = LoadingState | DataState<T> | ErrorState;
