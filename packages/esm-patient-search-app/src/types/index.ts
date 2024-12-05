import type { OpenmrsResource } from '@openmrs/esm-framework';

export interface SearchedPatient {
  uuid: string;
  identifiers: Array<Identifier>;
  person: {
    addresses: Array<Address>;
    age: number;
    birthdate: string;
    gender: string;
    dead: boolean;
    deathDate: string | null;
    personName: {
      display: string;
      givenName: string;
      familyName: string;
      middleName: string;
    };
  };
  attributes: Array<{
    value: OpenmrsResource | string;
    attributeType: { uuid: string; display: string };
  }>;
}

export interface Identifier {
  display: string;
  identifier: string;
  identifierType: OpenmrsResource;
  location: OpenmrsResource;
  uuid: string;
  preferred: boolean;
}

export interface Address {
  preferred: boolean;
  voided: boolean;
  address1: string;
  cityVillage: string;
  country: string;
  postalCode: string;
  stateProvince: string;
}

export interface FHIRPatientType {
  id: string;
  identifier: Array<FHIRIdentifier>;
  name: Array<FHIRName>;
  gender: string;
  birthDate: string;
  deceasedBoolean: boolean;
  deceasedDateTime: string;
  address: Array<{
    id: string;
    use: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
}

export interface FHIRIdentifier {
  id: string;
  use: string;
  value: string;
}

export interface FHIRName {
  id: string;
  family: string;
  given: Array<string>;
  text: string;
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
  currentPage: number;
  data?: Array<SearchedPatient>;
  fetchError: Error;
  hasMore: boolean;
  isLoading: boolean;
  isValidating: boolean;
  setPage: (page: number | ((_page: number) => number)) => Promise<unknown[] | undefined>;
  totalResults: number;
}

export interface AdvancedPatientSearchState {
  gender: 'any' | 'male' | 'female' | 'other' | 'unknown';
  dateOfBirth: number;
  monthOfBirth: number;
  yearOfBirth: number;
  postcode: string;
  age: number;
  attributes: {
    [key: string]: string;
  };
}

export interface User {
  uuid: string;
  userProperties: {
    [x: string]: string;
    patientsVisited: string;
    defaultLocation: string;
  };
}

export interface PersonAttributeTypeResponse {
  uuid: string;
  display: string;
  name?: string;
  description?: string;
  format: string;
}

export interface ConceptResponse {
  uuid: string;
  display: string;
  datatype: {
    uuid: string;
    display: string;
  };
  answers: Array<OpenmrsResource>;
  setMembers: Array<OpenmrsResource>;
}

export interface LocationEntry {
  resource: {
    id: string;
    name: string;
    resourceType: string;
    status: 'active' | 'inactive';
    meta?: {
      tag?: Array<{
        code: string;
        display: string;
        system: string;
      }>;
    };
  };
}

export interface LocationResponse {
  type: string;
  total: number;
  resourceType: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  id: string;
  entry: Array<LocationEntry>;
}

export type SearchFieldType = 'age' | 'dateOfBirth' | 'gender' | 'personAttribute' | 'postcode';

export interface SearchFieldConfig {
  name: string;
  type: SearchFieldType;
  placeholder?: string;
  answerConceptSetUuid?: string;
  conceptAnswersUuids?: Array<string>;
  locationTag?: string;
  attributeTypeUuid?: string;
  min?: number;
  max?: number;
}
