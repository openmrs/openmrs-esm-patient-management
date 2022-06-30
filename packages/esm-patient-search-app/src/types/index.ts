export interface SearchedPatient {
  uuid: string;
  patientIdentifier: { identifier: string };
  person: {
    addresses: Array<Address>;
    birthdate: string;
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
}

export interface Address {
  preferred: boolean;
  cityVillage: string;
  country: string;
  postalCode: string;
  stateProvince: string;
}
