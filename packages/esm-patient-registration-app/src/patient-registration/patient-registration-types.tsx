interface NameValue {
  uuid: string;
  preferred: boolean;
  givenName: string;
  middleName: string;
  familyName: string;
}

export interface AttributeValue {
  attributeType: string;
  value: string;
}

/**
 * Patient Identifier data as it is fetched and composed from the APIs.
 */
export interface FetchedPatientIdentifierType {
  name: string;
  required: boolean;
  uuid: string;
  fieldName: string;
  format: string;
  isPrimary: boolean;
}

export interface PatientIdentifierValue {
  uuid?: string;
  identifier: string;
  identifierTypeUuid?: string;
  source: IdentifierSource;
  autoGeneration?: boolean;
  preferred: boolean;
  /**
   * @kind ADD -> add a new identifier to a patient
   * @kind UPDATE -> update an existing patient identifier
   * @kind DELETE -> delete an existing patient identifier
   * @kind NONE -> No action to be taken on the patient identifier
   */
  action: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE';
}

export interface PatientRegistration {
  id?: number;
  /**
   * The preliminary patient in the FHIR format.
   */
  fhirPatient: fhir.Patient;
  /**
   * Internal data collected by patient-registration. Required for later syncing and editing.
   * Not supposed to be used outside of this module.
   */
  _patientRegistrationData: {
    isNewPatient: boolean;
    formValues: FormValues;
    patientUuidMap: PatientUuidMapType;
    initialAddressFieldValues: Record<string, any>;
    identifierTypes: Array<PatientIdentifierType>;
    capturePhotoProps: CapturePhotoProps;
    patientPhotoConceptUuid: string;
    currentLocation: string;
    personAttributeSections: any;
  };
}

/**
 * Extends the `FetchedPatientIdentifierType` with aggregated data.
 */
export interface PatientIdentifierType extends FetchedPatientIdentifierType {
  identifierSources: Array<IdentifierSource>;
  autoGenerationSource?: IdentifierSource;
  checked?: boolean;
  source?: IdentifierSource;
}

export interface PatientIdentifier {
  uuid?: string;
  identifier: string;
  identifierType?: string;
  location?: string;
  preferred?: boolean;
}

export type Relationship = {
  relationshipType: string;
  personA: string;
  personB: string;
};

export type Patient = {
  uuid: string;
  identifiers: Array<PatientIdentifier>;
  person: {
    uuid: string;
    names: Array<NameValue>;
    gender: string;
    birthdate: string;
    birthdateEstimated: boolean;
    attributes: Array<AttributeValue>;
    addresses: Array<Record<string, string>>;
    dead: boolean;
    deathDate?: string;
    causeOfDeath?: string;
  };
};

export interface IdentifierSource {
  uuid: string;
  name: string;
  autoGenerationOption: {
    manualEntryEnabled: boolean;
    automaticGenerationEnabled: boolean;
  };
}

export interface FormValues {
  patientUuid: string;
  givenName: string;
  middleName: string;
  familyName: string;
  unidentifiedPatient: boolean;
  additionalGivenName: string;
  additionalMiddleName: string;
  additionalFamilyName: string;
  addNameInLocalLanguage: boolean;
  gender: string;
  birthdate: string;
  yearsEstimated: number;
  monthsEstimated: number;
  birthdateEstimated: boolean;
  telephoneNumber: string;
  address1: string;
  address2: string;
  cityVillage: string;
  stateProvince: string;
  country: string;
  postalCode: string;
  isDead: boolean;
  deathDate: string;
  deathCause: string;
  relationships: Array<{ relatedPerson: string; relationship: string }>;
  identifiers: Array<PatientIdentifierValue>;
}

export interface PatientUuidMapType {
  additionalNameUuid?: string;
  preferredNameUuid?: string;
  preferredAddressUuid?: string;
}

export interface CapturePhotoProps {
  imageData: string;
  dateTime: string;
}

export interface AddressValidationSchemaType {
  name: string;
  label: string;
  regex: RegExp;
  regexFormat: string;
}
