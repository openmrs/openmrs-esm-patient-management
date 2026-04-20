# Patient Entity Analysis

**Updated Date:** 2026-04-17  
**Analyzed By:** Senior Business Analyst

---

## Table of Contents

1. [Overview](#overview)
2. [Related Files](#related-files)
3. [Data Schema](#data-schema)
4. [Business Rules](#business-rules)
5. [Legacy Constraints](#legacy-constraints)
6. [Diagrams](#diagrams)
7. [Key Insights](#key-insights)
8. [Questions & Todos](#questions--todos)

---

## Overview

This document provides a comprehensive analysis of the Patient entity in the OpenMRS patient management system. The analysis focuses on the data structure, validation rules, identifier management, and business constraints that govern patient registration and management.

### Purpose
- Document the complete patient data schema
- Identify validation rules and business constraints
- Understand identifier uniqueness and check digit algorithms
- Map legacy constraints for deceased and merged patients
- Provide technical specifications for mobile app development

### Scope
This analysis covers:
- Patient core attributes (names, identifiers, demographics)
- Person attributes and addresses
- Patient identifier types and validation
- Death information handling
- Validation schemas and business rules

---

## Related Files

### OpenMRS Source Files Analyzed

**Type Definitions:**
- `packages/esm-patient-registration-app/src/patient-registration/patient-registration.types.ts` - Core patient type definitions
- `packages/esm-patient-registration-app/src/config-schema.ts` - Configuration schema for patient registration

**Validation Logic:**
- `packages/esm-patient-registration-app/src/patient-registration/validation/patient-registration-validation.ts` - Yup validation schema
- `packages/esm-patient-registration-app/src/patient-registration/input/custom-input/identifier/utils.ts` - Identifier uniqueness validation

**Business Logic:**
- `packages/esm-patient-registration-app/src/patient-registration/form-manager.ts` - Patient save and update logic
- `packages/esm-patient-registration-app/src/offline.resources.ts` - Patient identifier type fetching

**Test Files:**
- `packages/esm-patient-registration-app/src/patient-registration/input/custom-input/identifier/utils.test.ts` - Identifier validation tests

---

## Data Schema

### Core Patient Structure

The Patient entity is composed of several interconnected data structures:

\`\`\`typescript
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
\`\`\`

### 1. Patient Names

**NameValue Structure:**
\`\`\`typescript
interface NameValue {
  uuid: string;
  preferred: boolean;
  givenName: string;
  middleName: string;
  familyName: string;
}
\`\`\`

**Attributes:**
- **uuid**: Unique identifier for the name record
- **preferred**: Boolean flag indicating the preferred name
- **givenName**: First name (required)
- **middleName**: Middle name (optional)
- **familyName**: Last name (required)

**Multiple Names Support:**
- Patients can have multiple names
- One name must be marked as preferred
- Support for additional names in local language
- Additional names are optional and controlled by `addNameInLocalLanguage` flag

**Configuration Options:**
- `displayMiddleName`: Show/hide middle name field (default: true)
- `allowUnidentifiedPatients`: Allow registration without real names (default: true)
- `defaultUnknownGivenName`: Default given name for unidentified patients (default: "UNKNOWN")
- `defaultUnknownFamilyName`: Default family name for unidentified patients (default: "UNKNOWN")
- `displayReverseFieldOrder`: Display names in reverse order (Family → Middle → Given)

### 2. Patient Identifiers

**PatientIdentifier Structure:**
\`\`\`typescript
export interface PatientIdentifier {
  uuid?: string;
  identifier: string;
  identifierType?: string;
  location?: string;
  preferred?: boolean;
}
\`\`\`

**FetchedPatientIdentifierType Structure:**
\`\`\`typescript
export interface FetchedPatientIdentifierType {
  name: string;
  required: boolean;
  uuid: string;
  fieldName: string;
  format: string;
  formatDescription?: string;
  isPrimary: boolean;
  uniquenessBehavior: undefined | null | 'UNIQUE' | 'NON_UNIQUE' | 'LOCATION';
}
\`\`\`

**Identifier Attributes:**
- **uuid**: Unique identifier for the identifier record
- **identifier**: The actual identifier value (e.g., "MRN-12345")
- **identifierType**: UUID of the identifier type
- **location**: UUID of the location where identifier is valid
- **preferred**: Boolean flag for preferred identifier
- **required**: Whether this identifier type is required
- **format**: Regular expression format for validation
- **formatDescription**: Human-readable format description
- **isPrimary**: Whether this is the primary identifier type
- **uniquenessBehavior**: Uniqueness constraint level

**Uniqueness Behaviors:**

1. **UNIQUE**: Identifier must be globally unique across all locations
   - Example: National ID, Social Security Number
   - System enforces uniqueness at database level
   - Offline mode blocks manual entry to prevent sync conflicts

2. **NON_UNIQUE**: Identifier can be duplicated
   - Example: Temporary ID, Paper form number
   - No uniqueness validation
   - Safe for offline entry

3. **LOCATION**: Identifier must be unique within a specific location
   - Example: Facility-specific MRN
   - Uniqueness enforced per location
   - Offline mode blocks manual entry to prevent conflicts

**Identifier Sources:**
\`\`\`typescript
export interface IdentifierSource {
  uuid: string;
  name: string;
  autoGenerationOption?: {
    manualEntryEnabled: boolean;
    automaticGenerationEnabled: boolean;
  };
}
\`\`\`

**Auto-Generation Options:**
- **Automatic Only**: System generates identifier, no manual entry
- **Manual Only**: User must enter identifier manually
- **Both**: User can choose to enter manually or auto-generate

### 3. Demographics

**Gender:**
\`\`\`typescript
gender: string; // 'male' | 'female' | 'other' | 'unknown'
\`\`\`

**FHIR Compliance:**
- Values limited to FHIR Administrative Gender specification
- Configurable labels for each gender option
- Default options: male, female, other, unknown

**Birthdate:**
\`\`\`typescript
birthdate: string; // ISO 8601 format: 'YYYY-MM-DD'
birthdateEstimated: boolean;
yearsEstimated: number;
monthsEstimated: number;
\`\`\`

**Birthdate Modes:**

1. **Exact Birthdate** (`birthdateEstimated: false`):
   - User enters exact date
   - Validated against constraints
   - Cannot be in future
   - Cannot be more than 140 years ago

2. **Estimated Birthdate** (`birthdateEstimated: true`):
   - User enters estimated years and months
   - System calculates approximate birthdate
   - Years: 0-140
   - Months: 0-11
   - Optional fixed day/month configuration

**Configuration Options:**
\`\`\`typescript
dateOfBirth: {
  allowEstimatedDateOfBirth: boolean; // default: true
  useEstimatedDateOfBirth: {
    enabled: boolean; // default: false
    dayOfMonth: number; // 0-31 (0 = last day of previous month)
    month: number; // 0-11 (0 = January, 11 = December)
  };
}
\`\`\`

### 4. Person Attributes

**AttributeValue Structure:**
\`\`\`typescript
export interface AttributeValue {
  attributeType: string; // UUID of attribute type
  value: string;
}
\`\`\`

**Common Attribute Types:**
- Phone number (UUID: `14d4f066-15f5-102d-96e4-000c29c2a5d7`)
- Email address
- Nationality
- Occupation
- Next of kin
- Custom attributes (configurable)

**Phone Number Configuration:**
\`\`\`typescript
phone: {
  personAttributeUuid: string;
  validation?: {
    required: boolean;
    matches?: string; // RegEx pattern
  };
}
\`\`\`

### 5. Addresses

**Address Structure:**
\`\`\`typescript
addresses: Array<Record<string, string>>;
\`\`\`

**Address Properties (15 fields):**
\`\`\`typescript
export type AddressProperties =
  | 'cityVillage'
  | 'stateProvince'
  | 'countyDistrict'
  | 'postalCode'
  | 'country'
  | 'address1'
  | 'address2'
  | 'address3'
  | 'address4'
  | 'address5'
  | 'address6'
  | 'address7'
  | 'address8'
  | 'address9'
  | 'address10'
  | 'address11'
  | 'address12'
  | 'address13'
  | 'address14'
  | 'address15';
\`\`\`

**Address Template:**
\`\`\`typescript
export interface AddressTemplate {
  displayName: string | null;
  codeName: string | null;
  country: string | null;
  lines: Array<Array<AddressField>> | null;
  lineByLineFormat: Array<string> | null;
  nameMappings: ExtensibleAddressProperties;
  sizeMappings: ExtensibleAddressProperties;
  elementDefaults: ExtensibleAddressProperties;
  elementRegex: ExtensibleAddressProperties;
  elementRegexFormats: ExtensibleAddressProperties;
  requiredElements: Array<AddressProperties> | null;
}
\`\`\`

**Address Features:**
- **Multiple Addresses**: Patient can have multiple addresses
- **Preferred Address**: One address marked as preferred
- **Address Hierarchy**: Hierarchical address selection (Country → State → City)
- **Quick Search**: Search existing addresses to pre-fill form
- **Required Elements**: Configurable required address fields
- **Validation**: RegEx validation per field

**Configuration Options:**
\`\`\`typescript
address: {
  useAddressHierarchy: {
    enabled: boolean; // default: true
    useQuickSearch: boolean; // default: true
    searchAddressByLevel: boolean; // default: false
  };
}
\`\`\`

### 6. Death Information

**Death Data Structure:**
\`\`\`typescript
dead: boolean;
deathDate?: string; // ISO 8601 datetime
causeOfDeath?: string; // Concept UUID
causeOfDeathNonCoded?: string; // Free text
\`\`\`

**Form Values for Death:**
\`\`\`typescript
isDead: boolean;
deathDate: string | Date;
deathTime: string; // Format: "hh:mm"
deathTimeFormat: 'AM' | 'PM';
deathCause: string; // Concept UUID
nonCodedCauseOfDeath: string; // Free text
\`\`\`

**Death Information Components:**

1. **Death Date**: Date when patient died
2. **Death Time**: Time of death in 12-hour format (hh:mm)
3. **Death Time Format**: AM or PM
4. **Death Cause**: Coded cause of death (concept)
5. **Non-Coded Cause**: Free text cause when coded option not available

**Configuration:**
\`\`\`typescript
causeOfDeath: {
  conceptUuid: string; // default: '9272a14b-7260-4353-9e5b-5787b5dead9d'
  required: boolean; // default: false
}
freeTextFieldConceptUuid: string; // default: '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
\`\`\`

### 7. Relationships

**Relationship Structure:**
\`\`\`typescript
export type Relationship = {
  relationshipType: string; // UUID
  personA: string; // UUID
  personB: string; // UUID
};
\`\`\`

**RelationshipValue (Form):**
\`\`\`typescript
export interface RelationshipValue {
  relatedPersonName?: string;
  relatedPersonUuid: string;
  relation?: string;
  relationshipType: string;
  action?: 'ADD' | 'UPDATE' | 'DELETE';
  initialrelationshipTypeValue?: string;
  uuid?: string;
}
\`\`\`

**Relationship Types:**
\`\`\`typescript
export interface RelationshipType {
  uuid: string;
  display: string;
  aIsToB: string; // e.g., "Parent"
  bIsToA: string; // e.g., "Child"
  displayAIsToB?: string;
  displayBIsToA?: string;
  description?: string;
}
\`\`\`

**Common Relationships:**
- Parent/Child
- Sibling/Sibling
- Spouse/Spouse
- Guardian/Dependent
- Doctor/Patient

---

## Business Rules

### 1. Name Validation Rules

**Required Fields:**
- Given name is required
- Family name is required

**Additional Name Rules:**
- If `addNameInLocalLanguage` is true:
  - Additional given name is required
  - Additional family name is required
- Middle name is always optional

**Validation Schema:**
\`\`\`typescript
givenName: Yup.string().required('Given name is required')
familyName: Yup.string().required('Family name is required')
additionalGivenName: Yup.string().when('addNameInLocalLanguage', {
  is: true,
  then: Yup.string().required('Given name is required'),
  otherwise: Yup.string().notRequired(),
})
\`\`\`

### 2. Gender Validation Rules

**Required Field:**
- Gender must be selected

**Valid Values:**
- Must be one of: 'male', 'female', 'other', 'unknown'
- Values are FHIR-compliant

**Validation Schema:**
\`\`\`typescript
gender: Yup.string()
  .oneOf(['male', 'female', 'other', 'unknown'], 'Gender unspecified')
  .required('Gender is required')
\`\`\`

### 3. Birthdate Validation Rules

**Exact Birthdate Mode** (`birthdateEstimated: false`):
- Birthdate is required
- Cannot be in the future
- Cannot be more than 140 years ago
- Must be a valid date

**Estimated Birthdate Mode** (`birthdateEstimated: true`):
- Years estimated is required
- Years must be between 0 and 140
- Months must be between 0 and 11 (if provided)
- Months cannot be negative

**Validation Schema:**
\`\`\`typescript
birthdate: Yup.date().when('birthdateEstimated', {
  is: false,
  then: Yup.date()
    .required('Birthday is required')
    .max(Date(), 'Birthday cannot be in future')
    .min(dayjs().subtract(140, 'years').toDate(), 
         'Birthday cannot be more than 140 years ago')
    .nullable(),
  otherwise: Yup.date().nullable(),
})

yearsEstimated: Yup.number().when('birthdateEstimated', {
  is: true,
  then: Yup.number()
    .required('Estimated years required')
    .min(0, 'Estimated years cannot be negative')
    .max(140, 'Estimated years cannot be more than 140'),
  otherwise: Yup.number().nullable(),
})

monthsEstimated: Yup.number()
  .min(0, 'Estimated months cannot be negative')
\`\`\`

### 4. Death Information Validation Rules

**When Patient is Marked as Dead** (`isDead: true`):

1. **Death Date**:
   - Required
   - Cannot be in the future
   - Must be after birthdate
   - Combined with death time, must be before current datetime

2. **Death Time**:
   - Required
   - Must match format: "hh:mm" (12-hour format)
   - Hours: 01-12
   - Minutes: 00-59

3. **Death Time Format**:
   - Required
   - Must be either 'AM' or 'PM'

4. **Death Cause**:
   - Required
   - Must be a valid concept UUID

5. **Non-Coded Cause of Death**:
   - Required only if death cause is the free text field concept UUID
   - Otherwise optional

**Validation Schema:**
\`\`\`typescript
deathDate: Yup.date()
  .when('isDead', {
    is: true,
    then: Yup.date().required('Death date is required'),
    otherwise: Yup.date().nullable(),
  })
  .max(new Date(), 'Death date cannot be in future')
  .test('deathDate-after-birthdate',
    'Death date and time cannot be before the birthday',
    function (value) {
      const { birthdate } = this.parent;
      if (birthdate && value) {
        return dayjs(value).isAfter(birthdate);
      }
      return true;
    }
  )

deathTime: Yup.string()
  .when('isDead', {
    is: true,
    then: Yup.string().required('Death time is required'),
    otherwise: Yup.string().nullable(),
  })
  .matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9])$/, 
           "Time doesn't match the format 'hh:mm'")

deathTimeFormat: Yup.string()
  .when('isDead', {
    is: true,
    then: Yup.string().required('Time format is required'),
    otherwise: Yup.string().nullable(),
  })
  .oneOf(['AM', 'PM'], 'Time format is invalid')

deathCause: Yup.string().when('isDead', {
  is: true,
  then: Yup.string().required('Cause of death is required'),
  otherwise: Yup.string().nullable(),
})

nonCodedCauseOfDeath: Yup.string().when(['isDead', 'deathCause'], {
  is: (isDead, deathCause) => isDead && deathCause === freeTextFieldConceptUuid,
  then: Yup.string().required('Non-coded cause of death is required'),
  otherwise: Yup.string().nullable(),
})
\`\`\`

### 5. Identifier Validation Rules

**Required Identifiers:**
- If identifier type is marked as `required: true`, identifier value must be provided
- Validation is dynamic based on identifier configuration

**Format Validation:**
- If `format` is specified, identifier must match the RegEx pattern
- Format description provides user guidance

**Uniqueness Validation:**
- **UNIQUE**: System validates global uniqueness
- **LOCATION**: System validates uniqueness within location
- **NON_UNIQUE**: No uniqueness validation

**Offline Mode Restrictions:**
- Unique identifiers with manual entry are blocked in offline mode
- Prevents sync conflicts when coming back online
- Auto-generated identifiers are allowed

**Validation Logic:**
\`\`\`typescript
export function shouldBlockPatientIdentifierInOfflineMode(
  identifierType: PatientIdentifierType
) {
  return (
    isUniqueIdentifierTypeForOffline(identifierType) &&
    !identifierType.identifierSources.some(
      (source) =>
        !source.autoGenerationOption?.manualEntryEnabled && 
        source.autoGenerationOption?.automaticGenerationEnabled
    )
  );
}

export function isUniqueIdentifierTypeForOffline(
  identifierType: FetchedPatientIdentifierType
) {
  return identifierType.uniquenessBehavior === 'UNIQUE' || 
         identifierType.uniquenessBehavior === 'LOCATION';
}
\`\`\`

**Validation Schema:**
\`\`\`typescript
identifiers: Yup.lazy((obj: FormValues['identifiers']) =>
  Yup.object(
    mapValues(obj, () =>
      Yup.object({
        required: Yup.bool(),
        identifierValue: Yup.string().when('required', {
          is: true,
          then: Yup.string().required('Identifier value is required'),
          otherwise: Yup.string().notRequired(),
        }),
      }),
    ),
  ),
)
\`\`\`

### 6. Email Validation Rules

**Optional Field:**
- Email is not required
- If provided, must be valid email format

**Validation Schema:**
\`\`\`typescript
email: Yup.string().optional().email('Invalid email')
\`\`\`

### 7. Relationship Validation Rules

**Required Fields:**
- Related person UUID is required
- Relationship type is required

**Validation Schema:**
\`\`\`typescript
relationships: Yup.array().of(
  Yup.object().shape({
    relatedPersonUuid: Yup.string().required(),
    relationshipType: Yup.string().required(),
  }),
)
\`\`\`

---

## Legacy Constraints

### 1. Deceased Patient Handling

**Current Implementation:**
- Full support for deceased patient registration
- Death information captured during registration or update
- Death date, time, and cause are stored

**Data Storage:**
\`\`\`typescript
person: {
  dead: boolean;
  deathDate?: string; // ISO 8601 datetime
  causeOfDeath?: string; // Concept UUID or null
  causeOfDeathNonCoded?: string; // Free text or null
}
\`\`\`

**Business Logic:**
\`\`\`typescript
static getPatientDeathInfo(values: FormValues, config?: RegistrationConfig) {
  const { isDead, deathDate, deathTime, deathTimeFormat, 
          deathCause, nonCodedCauseOfDeath } = values;

  if (!isDead) {
    return { dead: false };
  }

  const dateTimeOfDeath = toOmrsIsoString(
    getDatetime(deathDate, deathTime, deathTimeFormat)
  );

  return {
    dead: true,
    deathDate: dateTimeOfDeath,
    ...(deathCause === config?.freeTextFieldConceptUuid
      ? { causeOfDeathNonCoded: nonCodedCauseOfDeath, causeOfDeath: null }
      : { causeOfDeath: deathCause, causeOfDeathNonCoded: null }
    ),
  };
}
\`\`\`

**FHIR Mapping:**
\`\`\`typescript
fhirPatient: {
  deceasedBoolean: patient.person.dead,
  deceasedDateTime: patient.person.deathDate,
}
\`\`\`

**Constraints:**
- Once marked as dead, patient cannot be unmarked (no UI support)
- Death information is permanent
- No special handling for deceased patients in search or display

### 2. Merged Patient Records

**Current Implementation:**
- **No merge functionality found** in patient registration module
- Merge logic likely handled by core OpenMRS backend
- Registration app does not handle merged patient scenarios

**Implications:**
- Patient registration app assumes single, non-merged patient records
- Merge conflicts must be resolved at backend level
- Mobile app should be aware of potential merged records from API

**Potential Backend Behavior:**
- Merged patients may have `voided: true` flag
- Merged patient UUIDs may redirect to primary patient
- API may return merged patient information

### 3. Voided Patient Records

**Current Implementation:**
- **No voiding logic found** in patient registration module
- Voiding likely handled by backend API
- Registration app does not display or handle voided patients

**Implications:**
- Voided patients are filtered out by backend
- Registration app assumes all returned patients are active
- Mobile app should handle voided patients if exposed by API

### 4. Patient Updates vs. Creation

**Update Logic:**
\`\`\`typescript
static async savePatientIdentifiers(
  isNewPatient: boolean,
  patientUuid: string,
  patientIdentifiers: FormValues['identifiers'],
  initialIdentifierValues: FormValues['identifiers'],
  location: string,
): Promise<Array<PatientIdentifier>> {
  // For existing patients
  if (!isNewPatient) {
    if (!initialValue) {
      // Add new identifier
      await addPatientIdentifier(patientUuid, identifierToCreate);
    } else if (initialValue !== identifier) {
      // Update existing identifier
      await updatePatientIdentifier(patientUuid, identifierUuid, 
                                     identifierToCreate.identifier);
    }
  }
  
  // Delete removed identifiers
  Object.keys(initialIdentifierValues)
    .filter((identifierFieldName) => 
            !patientIdentifiers[identifierFieldName])
    .forEach(async (identifierFieldName) => {
      await deletePatientIdentifier(patientUuid, 
                                     initialIdentifierValues[identifierFieldName].identifierUuid);
    });
}
\`\`\`

**Update Constraints:**
- Patient UUID cannot be changed
- Identifiers can be added, updated, or deleted
- Names can be added or deleted
- Attributes can be added or deleted
- Addresses can be updated

### 5. Offline Synchronization

**Offline Patient Registration:**
\`\`\`typescript
static savePatientFormOffline: SavePatientForm = async (
  isNewPatient,
  values,
  patientUuidMap,
  initialAddressFieldValues,
  capturePhotoProps,
  currentLocation,
  initialIdentifierValues,
  currentUser,
  config,
) => {
  const syncItem: PatientRegistration = {
    fhirPatient: FormManager.mapPatientToFhirPatient(...),
    _patientRegistrationData: {
      isNewPatient,
      formValues: values,
      patientUuidMap,
      initialAddressFieldValues,
      capturePhotoProps,
      currentLocation,
      initialIdentifierValues,
      currentUser,
      config,
      savePatientTransactionManager: new SavePatientTransactionManager(),
    },
  };

  await queueSynchronizationItem(patientRegistration, syncItem, {
    id: values.patientUuid,
    displayName: 'Patient registration',
    patientUuid: syncItem.fhirPatient.id,
    dependencies: [],
  });
}
\`\`\`

**Offline Constraints:**
- Unique identifiers with manual entry are blocked
- Patient data queued for sync when online
- FHIR format used for offline storage
- Sync conflicts must be resolved when coming online

---

## Diagrams

### Patient Entity Class Diagram

\`\`\`mermaid
classDiagram
    class Patient {
        +String uuid
        +Array~PatientIdentifier~ identifiers
        +Person person
    }
    
    class Person {
        +String uuid
        +Array~NameValue~ names
        +String gender
        +String birthdate
        +Boolean birthdateEstimated
        +Array~AttributeValue~ attributes
        +Array~Address~ addresses
        +Boolean dead
        +String deathDate
        +String causeOfDeath
    }
    
    class NameValue {
        +String uuid
        +Boolean preferred
        +String givenName
        +String middleName
        +String familyName
    }
    
    class PatientIdentifier {
        +String uuid
        +String identifier
        +String identifierType
        +String location
        +Boolean preferred
    }
    
    class PatientIdentifierType {
        +String uuid
        +String name
        +Boolean required
        +String format
        +String formatDescription
        +Boolean isPrimary
        +String uniquenessBehavior
        +Array~IdentifierSource~ identifierSources
    }
    
    class IdentifierSource {
        +String uuid
        +String name
        +AutoGenerationOption autoGenerationOption
    }
    
    class AttributeValue {
        +String attributeType
        +String value
    }
    
    class Address {
        +String cityVillage
        +String stateProvince
        +String countyDistrict
        +String postalCode
        +String country
        +String address1-15
    }
    
    class Relationship {
        +String relationshipType
        +String personA
        +String personB
    }
    
    Patient "1" --> "1" Person
    Patient "1" --> "*" PatientIdentifier
    Person "1" --> "*" NameValue
    Person "1" --> "*" AttributeValue
    Person "1" --> "*" Address
    PatientIdentifier "*" --> "1" PatientIdentifierType
    PatientIdentifierType "1" --> "*" IdentifierSource
    Patient "*" --> "*" Relationship
\`\`\`

### Patient Registration Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Form
    participant Validation
    participant FormManager
    participant API
    
    User->>Form: Enter patient data
    Form->>Validation: Validate all fields
    
    alt Validation Fails
        Validation-->>Form: Return errors
        Form-->>User: Display validation errors
    else Validation Passes
        Form->>FormManager: Submit form values
        
        alt New Patient
            FormManager->>FormManager: Generate identifiers (if auto)
            FormManager->>API: POST /patient
            API-->>FormManager: Patient created (UUID)
            FormManager->>API: POST /encounter (if obs)
            FormManager->>API: POST /relationship (if any)
            FormManager->>API: POST /obs (if photo)
        else Update Patient
            FormManager->>FormManager: Compare with initial values
            FormManager->>API: DELETE removed names
            FormManager->>API: POST/PUT/DELETE identifiers
            FormManager->>API: POST /patient/{uuid}
            FormManager->>API: POST/PUT/DELETE relationships
        end
        
        FormManager-->>Form: Success (patient UUID)
        Form-->>User: Redirect to patient chart
    end
\`\`\`

### Identifier Uniqueness Validation Flow

\`\`\`mermaid
graph TD
    A[Identifier Type] --> B{uniquenessBehavior?}
    
    B -->|UNIQUE| C[Globally Unique]
    B -->|LOCATION| D[Unique per Location]
    B -->|NON_UNIQUE| E[No Uniqueness Check]
    B -->|null/undefined| E
    
    C --> F{Offline Mode?}
    D --> F
    E --> G[Allow Entry]
    
    F -->|Yes| H{Auto-generation?}
    F -->|No| I[Allow Entry with Validation]
    
    H -->|Auto Only| J[Allow - Generate ID]
    H -->|Manual Allowed| K[Block Entry]
    
    K --> L[Show Error: Offline Restriction]
    J --> G
    I --> M{Backend Validation}
    
    M -->|Duplicate Found| N[Show Error: Duplicate]
    M -->|Unique| O[Save Identifier]
    
    style C fill:#ffcccc
    style D fill:#ffcccc
    style E fill:#ccffcc
    style K fill:#ff9999
    style L fill:#ff9999
    style N fill:#ff9999
    style O fill:#ccffcc
\`\`\`

### Death Information Validation Flow

\`\`\`mermaid
graph TD
    A[isDead Flag] --> B{isDead = true?}
    
    B -->|No| C[Skip Death Validation]
    B -->|Yes| D[Require Death Date]
    
    D --> E[Require Death Time]
    E --> F[Require Time Format AM/PM]
    F --> G[Require Death Cause]
    
    G --> H{Death Cause Type?}
    
    H -->|Coded Concept| I[Use Concept UUID]
    H -->|Free Text UUID| J[Require Non-Coded Text]
    
    I --> K[Validate Death Date]
    J --> K
    
    K --> L{Date > Birthdate?}
    L -->|No| M[Error: Before Birthday]
    L -->|Yes| N{Date + Time < Now?}
    
    N -->|No| O[Error: In Future]
    N -->|Yes| P[Valid Death Info]
    
    style C fill:#ccffcc
    style M fill:#ff9999
    style O fill:#ff9999
    style P fill:#ccffcc
\`\`\`

---

## Key Insights

### 💡 Business Insights

- **Flexible Identifier System**: The system supports multiple identifier types with different uniqueness constraints, allowing for various use cases (national IDs, facility MRNs, temporary IDs). This flexibility is crucial for international deployments.

- **Estimated Birthdate Support**: The system recognizes that exact birthdates may not be known in all contexts, providing estimated age functionality. This is particularly important for resource-limited settings and elderly patients.

- **Comprehensive Death Recording**: Death information includes date, time (with AM/PM), and cause (coded or free text). This level of detail supports mortality reporting and epidemiological analysis.

- **Multi-Language Name Support**: Patients can have names in multiple languages, with one marked as preferred. This supports multilingual deployments and respects cultural naming conventions.

- **Configurable Validation**: Most validation rules are configurable through the config schema, allowing implementations to customize requirements without code changes.

- **FHIR Compliance**: Patient data is mapped to FHIR format for offline storage and interoperability, ensuring standards compliance.

- **Unidentified Patient Support**: The system can register patients without real names (using "UNKNOWN"), supporting emergency and unconscious patient scenarios.

### ⚠️ Risks & Warnings

- **No Check Digit Algorithm**: The codebase does not implement check digit algorithms (e.g., Luhn, Verhoeff) for identifier validation. Format validation relies solely on RegEx patterns, which may not catch transposition errors.

- **Offline Unique Identifier Conflicts**: Unique identifiers with manual entry are blocked in offline mode to prevent sync conflicts. This could impact workflows in low-connectivity environments where unique identifiers are required.

- **No Merge Handling**: The patient registration module does not handle merged patient records. If the backend merges patients, the registration app may not behave correctly when editing merged records.

- **No Voiding Support**: The registration app cannot void patients. Once created, patients remain in the system (though they can be marked as deceased).

- **Death Information Immutability**: Once a patient is marked as dead, there's no UI support to unmark them. This could be problematic if death was recorded in error.

- **Identifier Deletion Risk**: When updating a patient, if an identifier is removed from the form, it's deleted from the system. This could result in accidental data loss if not carefully managed.

- **140-Year Age Limit**: The hard-coded 140-year age limit may be too restrictive in rare cases, though it's reasonable for most scenarios.

- **Complex Validation Dependencies**: Many validation rules depend on other field values (conditional validation), making the validation logic complex and potentially error-prone.

- **No Duplicate Patient Detection**: The registration form does not check for potential duplicate patients before creation. Duplicate detection must be handled separately.

### 🔗 Connections & Integration Points

#### For Mobile App Development

**1. API Integration:**
- **Patient Creation**: `POST /ws/rest/v1/patient`
- **Patient Update**: `POST /ws/rest/v1/patient/{uuid}`
- **Identifier Management**: Separate endpoints for add/update/delete identifiers
- **Relationship Management**: `POST /ws/rest/v1/relationship`

**2. Identifier Type Fetching:**
- **Endpoint**: `GET /ws/rest/v1/patientidentifiertype`
- **Custom Representation**: Includes uniquenessBehavior, format, required fields
- **Primary Identifier**: Fetched via metadata mapping

**3. Validation Reuse:**
- **Yup Schema**: Can be reused in React Native with same validation library
- **Validation Rules**: Extract and replicate in mobile app
- **Error Messages**: Reuse translation keys for consistency

**4. Offline Considerations:**
- **FHIR Format**: Mobile app should use FHIR format for offline storage
- **Sync Queue**: Implement similar queue mechanism for offline registrations
- **Unique Identifier Blocking**: Replicate offline restrictions in mobile app

**5. Configuration:**
- **Config Schema**: Mobile app needs to fetch and respect configuration
- **Dynamic Fields**: Support custom fields defined in fieldDefinitions
- **Section Customization**: Respect section configuration

**6. Address Hierarchy:**
- **Address Template**: Fetch address template from API
- **Hierarchical Selection**: Implement cascading dropdowns
- **Quick Search**: Support address search for pre-filling

**7. Death Information:**
- **Time Format**: Use 12-hour format with AM/PM
- **Datetime Combination**: Combine date and time correctly
- **Cause of Death**: Support both coded and free text

**8. Photo Capture:**
- **Concept UUID**: Fetch from styleguide config
- **Observation**: Save photo as observation
- **Base64 Encoding**: Use base64 for image data

**9. Relationships:**
- **Person Search**: Need person search functionality
- **Relationship Types**: Fetch available relationship types
- **Bidirectional**: Handle aIsToB and bIsToA correctly

**10. Internationalization:**
- **Translation Keys**: Reuse translation keys from web app
- **i18next**: Use same i18next library in React Native
- **Locale Support**: Support same locales as web app

---

## Questions & Todos

### ❓ Questions for Review

1. **Check Digit Algorithms**: Are check digit algorithms (Luhn, Verhoeff) implemented at the backend level? If not, should mobile app implement them?

2. **Identifier Format Validation**: What are the common identifier formats used in production? Should we document standard formats?

3. **Merged Patient Handling**: How does the backend handle merged patients? What API responses should mobile app expect?

4. **Voided Patient Behavior**: Can voided patients be returned by the API? How should mobile app handle them?

5. **Death Information Updates**: Is there a way to correct death information if recorded in error? Should mobile app support this?

6. **Duplicate Detection**: Is there a duplicate patient detection API? Should mobile app check for duplicates before registration?

7. **Identifier Auto-Generation**: How does the auto-generation algorithm work? Is it sequential, random, or based on a pattern?

8. **Address Hierarchy Depth**: What is the maximum depth of address hierarchy? How many levels are typically used?

9. **Photo Storage**: Where are patient photos stored? Are they stored as observations or in a separate system?

10. **Relationship Constraints**: Are there any constraints on relationship types (e.g., can't have multiple spouses)?

### ✅ Todo Items

- [ ] Document common identifier formats and validation patterns
- [ ] Extract and document all translation keys used in patient registration
- [ ] Create mobile-optimized patient data structure (minimal fields)
- [ ] Document offline sync strategy for patient registration
- [ ] Map all configuration options to mobile app settings
- [ ] Create API endpoint catalog for patient management
- [ ] Document error handling patterns for API failures
- [ ] Create test data set for patient registration scenarios
- [ ] Document photo capture and storage requirements
- [ ] Create validation rule extraction script

### 🔍 Further Investigation Needed

- **Backend Identifier Validation**: Investigate backend validation logic for identifiers, including check digit algorithms
- **Merge Logic**: Analyze backend merge functionality and API behavior
- **Voiding Logic**: Understand voiding mechanism and its impact on patient records
- **Duplicate Detection**: Research duplicate patient detection algorithms and APIs
- **Identifier Sources**: Document all identifier source types and their configurations
- **Address Templates**: Collect address templates from various implementations
- **Relationship Rules**: Document business rules for relationships
- **Audit Trail**: Understand audit logging for patient changes
- **Data Privacy**: Document data privacy and security requirements
- **Performance**: Analyze performance implications of complex validation

---

**Last Updated:** 2026-04-17  
**Next Review:** 2026-04-24
