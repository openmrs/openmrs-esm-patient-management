import { type OpenmrsResource } from '@openmrs/esm-framework';

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

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Array<any>;
  person: Person;
}

export interface Person {
  age: number;
  attributes: Array<Attribute>;
  birthDate: string;
  gender: string;
  display: string;
  preferredAddress: OpenmrsResource;
  uuid: string;
}

export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
}
