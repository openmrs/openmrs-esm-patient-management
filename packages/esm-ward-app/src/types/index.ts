import { type OpenmrsResource } from '@openmrs/esm-framework';

interface MappedBedAssignment {
  patientInfo: MappedBedPatientInfo;
  bed: MappedBed;
}

export interface MappedBed {
  bedNumber: string;
}

export interface MappedBedPatientInfo {
  patient: Patient;
  observations: Observation[];
}

export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
}

export interface Concept extends OpenmrsResource {}

export interface Provider extends OpenmrsResource {}

export interface PatientIdentifierType extends OpenmrsResource {}

export interface Person {
  uuid: string;
  display: string;
  gender: string;
  age: number;
  birthdate: string;
  birthdateEstimated: boolean;
  dead: boolean;
  deathDate: string;
  causeOfDeath: Concept;
  preferredName: PersonName;
  preferredAddress: PersonAddress;
  names: Array<PersonName>;
  addresses: Array<PersonAddress>;
  attributes: Array<Attribute>;
  birthtime: string;
  deathdateEstimated: boolean;
  causeOfDeathNonCoded: string;
}

export interface PersonName {
  uuid: string;
  display: string;
  givenName: string;
  middleName: string;
  familyName: string;
  familyName2: string;
}

export interface PersonAddress {
  uuid: string;
  display: string;
  preferred: true;
  cityVillage: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  countyDistrict: string;
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
  address1: string;
  address2: string;
  address3: string;
  address4: string;
  address5: string;
  address6: string;
  address7: string;
  address8: string;
  address9: string;
  address10: string;
  address11: string;
  address12: string;
  address13: string;
  address14: string;
  address15: string;
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: PatientIdentifier[];
  person: Person;
}

export interface PatientIdentifier {
  uuid: string;
  display: string;
  identifier: string;
  identifierType: PatientIdentifierType;
  location: Location;
  preferred: boolean;
}
