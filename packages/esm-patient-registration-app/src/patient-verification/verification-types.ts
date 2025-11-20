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

interface Meta {
  versionId?: string;
  lastUpdated?: string;
}

interface Extension {
  url: string;
  valueString?: string;
  valueReference?: {
    reference: string;
    type: string;
    display: string;
  };
  extension?: Extension[];
}

interface Coding {
  code: string;
  system?: string;
  display?: string;
}

interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

interface Identifier {
  id?: string;
  extension?: Extension[];
  use?: string;
  type?: CodeableConcept;
  system?: string;
  value: string;
}

interface HumanName {
  id?: string;
  use?: string;
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

interface Address {
  id?: string;
  extension?: Extension[];
  use?: string;
  type?: string;
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface TextDiv {
  status: string;
  div: string;
}

interface Contact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: string[];
  address?: Address;
  gender?: string;
  organization?: string;
}

interface Patient {
  resourceType: 'Patient';
  id: string;
  meta?: Meta;
  text?: TextDiv;
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: string[];
  gender?: string;
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  multipleBirth?: boolean | number;
  contact?: Contact[];
  communication?: CodeableConcept[];
}

interface BundleEntry {
  fullUrl?: string;
  resource: Patient;
}

interface BundleLink {
  relation: string;
  url: string;
}

export interface ClientRegistryFhirPatientResponse {
  resourceType: 'Bundle';
  id: string;
  meta?: Meta;
  type: string;
  total: number;
  link?: BundleLink[];
  entry?: BundleEntry[];
}

interface CrAddress {
  addressId: string;
  type: string; // e.g., 'postal', 'RESIDENTIAL'
  text: string;
  cell: string;
  sector: string;
  line: string[];
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CrPatient {
  openMrsId: string | null;
  surName: string;
  postNames: string;
  fatherName: string;
  motherName: string;
  spouse: string;
  dateOfBirth: string; // Date format as string (ISO 8601)
  age: string;
  gender: string; // e.g., 'MALE', 'FEMALE'
  maritalStatus: string;
  identifiers: Identifier[];
  phoneNumber: string;
  nationality: string;
  addressList: CrAddress[];
  origin: string;
  originRank: string;
  educationalLevel: string;
  profession: string;
  religion: string;
  citizenStatus: boolean;
  registeredOn: string | null; // Can be null if not registered
}

export interface ClientRegistryPatientResponse {
  status: string; // e.g., 'SUCCESS'
  results: Array<CrPatient>;
  recordsCount: number;
}
