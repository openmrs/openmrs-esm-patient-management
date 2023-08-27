export interface ClientIdentification {
  identificationType: string;
  identificationNumber: string;
}

interface ClientContact {
  primaryPhone: string;
  secondaryPhone?: string;
  emailAddress?: string;
}

export interface ClientRegistryPatient {
  clientExists: boolean;
  client?: RegistryPatient;
}

export interface RegistryPatient {
  clientNumber?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  maritalStatus?: string;
  gender: string;
  occupation?: string;
  religion?: string;
  educationLevel?: string;
  country: string;
  countyOfBirth?: string;
  isAlive: boolean;
  originFacilityKmflCode?: string;
  isOnART?: string;
  nascopCCCNumber?: string;
  residence: {
    county: string;
    subCounty: string;
    ward: string;
    village: string;
    landmark: string;
    address: string;
  };
  identifications: Array<ClientIdentification>;
  contact: ClientContact;
  nextOfKins: Array<{
    name: string;
    relationship: string;
    residence: string;
    contact: ClientContact;
  }>;
}
