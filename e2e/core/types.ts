export interface Patient {
  uuid: string;
  identifiers: Identifier[];
  person: {
    display: string;
    addresses: Address[];
    age: number;
    birthdate: string;
    gender: string;
    death: boolean;
    deathDate: string;
  };
  attributes: { value: string; attributeType: { uuid: string; display: string } }[];
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
