import { FetchResponse } from '@openmrs/esm-framework';
export interface SearchedPatient {
  uuid: string;
  identifiers: Array<{ identifier: string; isMPIRecordId?: true }>;
  person: {
    addresses: Array<Address>;
    age: number;
    birthdate: string;
    gender: string;
    death: boolean;
    deathDate: string;
    personName: {
      display: string;
      givenName: string;
      familyName: string;
      middleName: string;
    };
  };
  attributes: Array<{ value: string; attributeType: { uuid: string; display: string } }>;
}
export interface Address {
  preferred: boolean;
  address1: string;
  cityVillage: string;
  country: string;
  postalCode: string;
  stateProvince: string;
}
export interface FHIRPatientType {
  id: string;
  identifier: Array<{
    id: string;
    use: string;
    value: string;
  }>;
  name: Array<{
    id: string;
    family: string;
    given: Array<string>;
  }>;
  gender: string;
  birthDate: string;
  deceasedBoolean: boolean;
  address: Array<{
    id: string;
    use: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
}
export interface FHIRPatientSearchResponse {
  total: number;
  link?: Array<{
    relation: 'self' | 'previous' | 'next';
    url: string;
  }>;
  entry: Array<{
    resource: FHIRPatientType;
  }>;
}
export interface PatientSearchResponse {
  data?: Array<SearchedPatient>;
  isLoading: boolean;
  fetchError: Error;
  loadingNewData: boolean;
  hasMore: boolean;
  currentPage: number;
  totalResults: number;
  setPage: (size: number | ((_size: number) => number)) => Promise<
    FetchResponse<{
      results: Array<SearchedPatient>;
      links: Array<{
        rel: 'prev' | 'next';
      }>;
    }>[]
  >;
}

export interface AdvancedPatientSearchState {
  gender: 'any' | 'male' | 'female' | 'other' | 'unknown';
  dateOfBirth: number;
  monthOfBirth: number;
  yearOfBirth: number;
  phoneNumber: number;
  postcode: string;
  age: number;
}

export enum AdvancedPatientSearchActionTypes {
  SET_GENDER,
  SET_DATE_OF_BIRTH,
  SET_MONTH_OF_BIRTH,
  SET_YEAR_OF_BIRTH,
  SET_PHONE_NUMBER,
  SET_POSTCODE,
  SET_AGE,
  RESET_FIELDS,
}

export interface AdvancedPatientSearchAction {
  type: AdvancedPatientSearchActionTypes;
  gender?: 'any' | 'male' | 'female' | 'other' | 'unknown';
  dateOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  phoneNumber?: number;
  postcode?: string;
  age?: number;
}

export type DataSource = 'EMR' | 'MPI';
