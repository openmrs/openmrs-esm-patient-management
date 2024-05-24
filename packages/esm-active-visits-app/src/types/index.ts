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
  visitType: OpenmrsResource;
  location?: OpenmrsResource;
  startDatetime: string;
  stopDatetime?: string;
  attributes?: Array<OpenmrsResource>;
}
