import camelCase from 'lodash-es/camelCase';
import { parseDate } from '@openmrs/esm-framework';
import {
  type Encounter,
  type FormValues,
  type PatientIdentifierValue,
  type PatientUuidMapType,
} from './patient-registration.types';
import {
  type FieldDefinition,
  type HideIfAgeCondition,
  type HideIfCondition,
  type RegistrationConfig,
  type SectionDefinition,
  builtInSections,
} from '../config-schema';

export function scrollIntoView(viewId: string) {
  document.getElementById(viewId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
    inline: 'center',
  });
}

export function cancelRegistration() {
  window.history.back();
}

export function getFormValuesFromFhirPatient(patient: fhir.Patient) {
  const result = {} as FormValues;
  const patientName = patient.name[0];
  const additionalPatientName = patient.name[1];

  result.patientUuid = patient.id;
  result.givenName = patientName?.given[0];
  result.middleName = patientName?.given[1];
  result.familyName = patientName?.family;
  result.addNameInLocalLanguage = !!additionalPatientName ? true : undefined;
  result.additionalGivenName = additionalPatientName?.given[0];
  result.additionalMiddleName = additionalPatientName?.given[1];
  result.additionalFamilyName = additionalPatientName?.family;

  result.gender = patient.gender;
  result.birthdate = patient.birthDate ? parseDate(patient.birthDate) : undefined;
  result.telephoneNumber = patient.telecom ? patient.telecom[0].value : '';

  return {
    ...result,
    ...patient.identifier.map((identifier) => {
      const key = camelCase(identifier.system || identifier.type.text);
      return { [key]: identifier.value };
    }),
  };
}

export function getAddressFieldValuesFromFhirPatient(patient: fhir.Patient) {
  const result = {};
  const address = patient.address?.[0];

  if (address) {
    for (const key of Object.keys(address)) {
      switch (key) {
        case 'city':
          result['cityVillage'] = address[key];
          break;
        case 'state':
          result['stateProvince'] = address[key];
          break;
        case 'district':
          result['countyDistrict'] = address[key];
          break;
        case 'extension':
          address[key].forEach((ext) => {
            ext.extension.forEach((extension) => {
              result[extension.url.split('#')[1]] = extension.valueString;
            });
          });
          break;
        default:
          if (key === 'country' || key === 'postalCode') {
            result[key] = address[key];
          }
      }
    }
  }

  return result;
}

export function getPatientUuidMapFromFhirPatient(patient: fhir.Patient): PatientUuidMapType {
  const patientName = patient.name[0];
  const additionalPatientName = patient.name[1];
  const address = patient.address?.[0];

  return {
    preferredNameUuid: patientName?.id,
    additionalNameUuid: additionalPatientName?.id,
    preferredAddressUuid: address?.id,
    ...patient.identifier.map((identifier) => {
      const key = camelCase(identifier.system || identifier.type.text);
      return { [key]: { uuid: identifier.id, value: identifier.value } };
    }),
  };
}

export function getPhonePersonAttributeValueFromFhirPatient(patient: fhir.Patient) {
  const result = {};
  if (patient.telecom) {
    result['phone'] = patient.telecom[0].value;
  }
  return result;
}

type IdentifierMap = { [identifierFieldName: string]: PatientIdentifierValue };
export const filterOutUndefinedPatientIdentifiers = (patientIdentifiers: IdentifierMap): IdentifierMap =>
  Object.fromEntries(
    Object.entries(patientIdentifiers).filter(
      ([key, value]) =>
        (value.autoGeneration && value.selectedSource.autoGenerationOption.manualEntryEnabled) ||
        value.identifierValue !== undefined,
    ),
  );

export const latestFirstEncounter = (a: Encounter, b: Encounter) =>
  new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime();

export function getAgeInYears(values: FormValues): number | undefined {
  if (values?.birthdate) {
    const birthDate = new Date(values.birthdate);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  }
  return values?.yearsEstimated ?? undefined;
}

export function shouldHideElement(
  element: { hideIf?: HideIfCondition; hideIfAge?: HideIfAgeCondition },
  values: FormValues,
  config: RegistrationConfig,
  ageInYears?: number,
): boolean {
  if (element.hideIf) {
    const { fieldId, value, notEquals } = element.hideIf as any;

    // Find the field definition to know how to look up its value
    const fieldDef = config.fieldDefinitions.find((f) => f.id === fieldId);
    let currentValue: any;

    if (fieldDef) {
      if (fieldDef.type === 'person attribute') {
        currentValue = values.attributes?.[fieldDef.uuid];
      } else if (fieldDef.type === 'obs') {
        currentValue = values.obs?.[fieldDef.uuid];
      }
    } else {
      // It might be a built-in field or boolean flag at the root
      currentValue = values[fieldId];
    }

    const normalizedCurrentValue = currentValue === undefined || currentValue === null ? '' : String(currentValue);

    // Convert string 'true' / 'false' if needed, or simple equality
    if (value !== undefined && normalizedCurrentValue === String(value)) {
      return true;
    }
    if (notEquals !== undefined && normalizedCurrentValue !== String(notEquals)) {
      return true;
    }
  }

  if (element.hideIfAge && ageInYears !== undefined) {
    const { operator, value } = element.hideIfAge;
    switch (operator) {
      case '<':
        if (ageInYears < value) return true;
        break;
      case '>':
        if (ageInYears > value) return true;
        break;
      case '<=':
        if (ageInYears <= value) return true;
        break;
      case '>=':
        if (ageInYears >= value) return true;
        break;
      case '==':
        if (ageInYears === value) return true;
        break;
    }
  }

  return false;
}

export function getHiddenFieldIds(values: FormValues, config: RegistrationConfig, ageInYears?: number): Set<string> {
  const computedAge = ageInYears !== undefined ? ageInYears : getAgeInYears(values);

  const sections: Array<SectionDefinition> = (config?.sections || [])
    .map(
      (sectionName) =>
        config?.sectionDefinitions?.find((s) => s.id === sectionName) ??
        builtInSections.find((s) => s.id === sectionName),
    )
    .filter(Boolean);

  const hiddenFieldIds = new Set<string>();

  // Check sections: if a section is hidden, all its fields are hidden
  sections.forEach((section) => {
    if (shouldHideElement(section, values, config, computedAge)) {
      (section.fields || []).forEach((fieldId) => hiddenFieldIds.add(fieldId));
    }
  });

  // Check individual fields in config.fieldDefinitions
  (config?.fieldDefinitions || []).forEach((fieldDef) => {
    if (shouldHideElement(fieldDef, values, config, computedAge)) {
      hiddenFieldIds.add(fieldDef.id);
    }
  });

  return hiddenFieldIds;
}

export function sanitizeFormValuesForSkipLogic(values: FormValues, config: RegistrationConfig): FormValues {
  if (!config) {
    return values;
  }

  const sanitizedValues = { ...values };
  if (sanitizedValues.attributes) {
    sanitizedValues.attributes = { ...sanitizedValues.attributes };
  }
  if (sanitizedValues.obs) {
    sanitizedValues.obs = { ...sanitizedValues.obs };
  }

  const ageInYears = getAgeInYears(values);
  let previousHiddenCount = -1;
  let hiddenFieldIds = getHiddenFieldIds(sanitizedValues, config, ageInYears);

  // Iteratively clean fields until hidden fields stabilize (handles cascading skip logic)
  while (hiddenFieldIds.size > previousHiddenCount) {
    previousHiddenCount = hiddenFieldIds.size;

    hiddenFieldIds.forEach((fieldId) => {
      const fieldDef = config.fieldDefinitions?.find((f) => f.id === fieldId);
      if (fieldDef) {
        if (fieldDef.type === 'person attribute') {
          if (sanitizedValues.attributes && fieldDef.uuid in sanitizedValues.attributes) {
            delete sanitizedValues.attributes[fieldDef.uuid];
          }
        } else if (fieldDef.type === 'obs') {
          if (sanitizedValues.obs && fieldDef.uuid in sanitizedValues.obs) {
            delete sanitizedValues.obs[fieldDef.uuid];
          }
        }
      } else {
        // Explicit allowlist of clearable built-in fields. Core fields (name, gender, dob, id)
        // are never deleted so that hiding a section with built-in fields does not break submit.
        if (fieldId === 'phone') {
          const phoneUuid = config.fieldConfigurations?.phone?.personAttributeUuid;
          if (phoneUuid && sanitizedValues.attributes && phoneUuid in sanitizedValues.attributes) {
            delete sanitizedValues.attributes[phoneUuid];
          }
        } else if (fieldId === 'causeOfDeath') {
          sanitizedValues.deathCause = '';
          sanitizedValues.nonCodedCauseOfDeath = '';
        } else if (fieldId === 'dateAndTimeOfDeath') {
          sanitizedValues.deathDate = '';
          sanitizedValues.deathTime = '';
        }
      }
    });

    hiddenFieldIds = getHiddenFieldIds(sanitizedValues, config, ageInYears);
  }

  return sanitizedValues;
}
