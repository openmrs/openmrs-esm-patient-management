import { type OpenmrsResource } from '@openmrs/esm-framework';

export type PatientRegistrationSex = 'male' | 'female' | 'other' | 'unknown';

export interface PatientRegistrationFormValues {
  givenName?: string;
  middleName?: string;
  familyName?: string;
  sex?: PatientRegistrationSex;
  birthdate?: {
    day: string;
    month: string;
    year: string;
  };
  postalCode?: string;
  address1?: string;
  address2?: string;
  country?: string;
  countyDistrict?: string;
  stateProvince?: string;
  cityVillage?: string;
  phone?: string;
  email?: string;
}

export interface Encounter {
  uuid: string;
  encounterDateTime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: Array<Observation>;
  orders: Array<Order>;
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}

export interface Order {
  uuid: string;
  dateActivated: string;
  dateStopped?: Date | null;
  dose: number;
  dosingInstructions: string | null;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
    display: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderNumber: string;
  orderReason: string | null;
  orderReasonNonCoded: string | null;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  quantity: number;
  quantityUnits: OpenmrsResource;
}

export interface Provider {
  uuid: string;
  display: string;
  comments?: string;
  response?: string;
  person: OpenmrsResource;
  name?: string;
}

export interface CohortType {
  uuid: string;
  name: string;
  description: string;
  display: string;
  links: { rel: string; uri: string; resourceAlias: string }[];
  resourceVersion: string;
}

export interface Cohort {
  uuid: string;
  name: string;
  description: string;
  attributes: any[];
  links: any[];
  location: any;
  groupCohort: boolean | null;
  startDate: Date;
  endDate: Date;
  voidReason: string | null;
  voided: boolean;
  isStarred?: boolean;
  type?: string;
  size: number;
  cohortType?: CohortType;
  resourceVersion: string;
}

export interface CohortMember {
  attributes: Array<any>;
  description: string;
  endDate: string;
  startDate: string;
  name: string;
  uuid: string;
  patient: Patient;
}

export interface Patient {
  uuid: string;
  identifiers: Identifier[];
  display: string;
  person: {
    uuid: string;
    display: string;
    gender: string;
    age: number;
    birthdate: string;
    birthdateEstimated: boolean;
    dead: boolean;
    deathDate?: any;
    causeOfDeath?: any;
    preferredAddress: {
      address1: string;
      cityVillage: string;
      country: string;
      postalCode: string;
      stateProvince: string;
      countyDistrict: string;
    };
    attributes: any[];
    voided: boolean;
    birthtime?: any;
    deathdateEstimated: boolean;
    resourceVersion: string;
  };
  attributes: { value: string; attributeType: { uuid: string; display: string } }[];
  voided: boolean;
}

export interface Address {
  preferred: boolean;
  address1: string;
  cityVillage: string;
  country: string;
  postalCode: string;
  stateProvince: string;
}

export interface Identifier {
  uuid: string;
  display: string;
}
