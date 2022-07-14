import { FetchResponse } from '@openmrs/esm-framework';

export interface SearchedPatient {
  uuid: string;
  identifiers: Array<{ identifier: string }>;
  person: {
    addresses: Array<Address>;
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
  attributes: Array<{ value: string; attributeType: { name: string } }>;
}

export interface Address {
  preferred: boolean;
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
