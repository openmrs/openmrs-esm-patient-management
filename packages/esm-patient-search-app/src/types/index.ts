import { FetchResponse } from '@openmrs/esm-framework';

export interface SearchedPatient {
  patientId: number;
  uuid: string;
  identifiers: Array<Identifier>;
  patientIdentifier: { identifier: string };
  person: {
    addresses: Array<Address>;
    age: number;
    birthdate: string;
    display: string;
    gender: string;
    death: boolean;
    deathDate: string;
    personName: {
      givenName: string;
      familyName: string;
      middleName: string;
    };
  };
  attributes: Array<{ value: string; attributeType: { name: string } }>;
  display: string;
}

export interface Identifier {
  display: string;
  uuid: string;
  identifier: string;
  identifierType: {
    uuid: string;
    display: string;
  };
  location: {
    uuid: string;
    display: string;
  };
  preferred: boolean;
  voided: boolean;
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
  setPage: (size: number | ((_size: number) => number)) => Promise<
    FetchResponse<{
      results: Array<SearchedPatient>;
      links: Array<{
        rel: 'prev' | 'next';
      }>;
    }>[]
  >;
}
