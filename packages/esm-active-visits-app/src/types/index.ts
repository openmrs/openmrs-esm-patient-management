import { type OpenmrsResource } from '@openmrs/esm-framework';

export interface SearchedPatient {
  patientId: number;
  uuid: string;
  identifiers: Array<Identifier>;
  person: {
    age: number;
    birthdate: string;
    display: string;
    gender: string;
  };
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

export interface Visit {
  uuid: string;
  display?: string;
  encounters: Array<OpenmrsResource>;
  patient?: OpenmrsResource;
  visitType: VisitType;
  location?: Location;
  startDatetime: string;
  stopDatetime?: string;
  attributes?: Array<OpenmrsResource>;
  [anythingElse: string]: any;
}

export interface Location {
  uuid: string;
  display?: string;
  name?: string;
}

export interface VisitType {
  uuid: string;
  display: string;
  name?: string;
}
