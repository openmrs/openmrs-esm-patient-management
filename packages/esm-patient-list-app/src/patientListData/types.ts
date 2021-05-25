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
  properies: Array<PatientListMemberProperty>;
}

export interface PatientListMemberProperty {
  type: string;
  value: string | number;
}

export interface PatientListMemberFilter {
  // ??
}
