import camelCase from 'lodash-es/camelCase';
import { parseDate } from '@openmrs/esm-framework';
import {
  type Encounter,
  type FormValues,
  type PatientIdentifierValue,
  type PatientUuidMapType,
} from './patient-registration.types';
import {
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

// Where the value of each built-in field lives in the form values. Composite built-ins
// (name, id, address) have no single value and so cannot be referenced by hideIf.
const builtInFieldValueGetters: Record<string, (values: FormValues, config: RegistrationConfig) => unknown> = {
  gender: (values) => values.gender,
  dob: (values) => values.birthdate,
  phone: (values, config) => values.attributes?.[config.fieldConfigurations?.phone?.personAttributeUuid],
  causeOfDeath: (values) => values.deathCause,
  dateAndTimeOfDeath: (values) => values.deathDate,
};

export function getFieldValue(fieldId: string, values: FormValues, config: RegistrationConfig): unknown {
  const fieldDef = config.fieldDefinitions?.find((f) => f.id === fieldId);
  if (fieldDef) {
    if (fieldDef.type === 'person attribute') {
      return values.attributes?.[fieldDef.uuid];
    }
    if (fieldDef.type === 'obs') {
      return values.obs?.[fieldDef.uuid];
    }
    return undefined;
  }

  const getBuiltInValue = builtInFieldValueGetters[fieldId];
  // Fall back to a root-level form value, e.g. a boolean flag such as isDead
  return getBuiltInValue ? getBuiltInValue(values, config) : values[fieldId];
}

export function shouldHideElement(
  element: { hideIf?: HideIfCondition; hideIfAge?: HideIfAgeCondition },
  values: FormValues,
  config: RegistrationConfig,
  ageInYears?: number,
): boolean {
  if (element.hideIf) {
    const { fieldId, value, notEquals } = element.hideIf;
    const currentValue = getFieldValue(fieldId, values, config);
    const normalizedCurrentValue = currentValue === undefined || currentValue === null ? '' : String(currentValue);

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

export interface HiddenElements {
  fieldIds: Set<string>;
  sectionIds: Set<string>;
}

function getConfiguredSections(config: RegistrationConfig): Array<SectionDefinition> {
  return (config?.sections || [])
    .map(
      (sectionName) =>
        config?.sectionDefinitions?.find((s) => s.id === sectionName) ??
        builtInSections.find((s) => s.id === sectionName),
    )
    .filter(Boolean);
}

function evaluateHiddenElements(
  values: FormValues,
  config: RegistrationConfig,
  sections: Array<SectionDefinition>,
  ageInYears: number | undefined,
): HiddenElements {
  const fieldIds = new Set<string>();
  const sectionIds = new Set<string>();

  // If a section is hidden, all its fields are hidden
  sections.forEach((section) => {
    if (shouldHideElement(section, values, config, ageInYears)) {
      sectionIds.add(section.id);
      (section.fields || []).forEach((fieldId) => fieldIds.add(fieldId));
    }
  });

  (config?.fieldDefinitions || []).forEach((fieldDef) => {
    if (shouldHideElement(fieldDef, values, config, ageInYears)) {
      fieldIds.add(fieldDef.id);
    }
  });

  return { fieldIds, sectionIds };
}

function areSetsEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((item) => b.has(item));
}

/**
 * Returns the fields and sections hidden by skip logic. This is the single source of truth for
 * both rendering and submission, so a field is only ever saved if it is shown.
 *
 * A hidden field may still hold a stale value; conditions that reference it must see it as empty,
 * otherwise a dependent field would stay visible in the UI and then be dropped on submit. So the
 * conditions are re-evaluated against the values with hidden fields cleared until the result stops
 * changing. The pass limit guards against conditions that alternate forever.
 */
export function getHiddenElements(values: FormValues, config: RegistrationConfig): HiddenElements {
  const ageInYears = getAgeInYears(values);
  const sections = getConfiguredSections(config);
  const maxPasses = sections.length + (config?.fieldDefinitions?.length ?? 0) + 1;

  let hidden = evaluateHiddenElements(values, config, sections, ageInYears);
  for (let pass = 0; pass < maxPasses; pass++) {
    const next = evaluateHiddenElements(
      clearHiddenFieldValues(values, hidden.fieldIds, config),
      config,
      sections,
      ageInYears,
    );
    if (areSetsEqual(next.fieldIds, hidden.fieldIds) && areSetsEqual(next.sectionIds, hidden.sectionIds)) {
      break;
    }
    hidden = next;
  }

  return hidden;
}

function clearHiddenFieldValues(
  values: FormValues,
  hiddenFieldIds: Set<string>,
  config: RegistrationConfig,
  initialAddress?: FormValues['address'],
): FormValues {
  const clearedValues = { ...values };
  if (clearedValues.attributes) {
    clearedValues.attributes = { ...clearedValues.attributes };
  }
  if (clearedValues.obs) {
    clearedValues.obs = { ...clearedValues.obs };
  }

  hiddenFieldIds.forEach((fieldId) => {
    const fieldDef = config.fieldDefinitions?.find((f) => f.id === fieldId);
    if (fieldDef) {
      if (fieldDef.type === 'person attribute') {
        delete clearedValues.attributes?.[fieldDef.uuid];
      } else if (fieldDef.type === 'obs') {
        delete clearedValues.obs?.[fieldDef.uuid];
      }
      return;
    }

    // Name, gender, dob and id are never cleared because the backend requires them.
    // Address and phone are optional, so they are stripped.
    switch (fieldId) {
      case 'phone': {
        const phoneUuid = config.fieldConfigurations?.phone?.personAttributeUuid;
        if (phoneUuid) {
          delete clearedValues.attributes?.[phoneUuid];
        }
        break;
      }
      case 'address':
        // Restore the address the form started with, so typed values are not saved and an
        // existing patient's address is not wiped
        clearedValues.address = { ...(initialAddress ?? {}) };
        break;
      case 'causeOfDeath':
        clearedValues.deathCause = '';
        clearedValues.nonCodedCauseOfDeath = '';
        break;
      case 'dateAndTimeOfDeath':
        clearedValues.deathDate = '';
        clearedValues.deathTime = '';
        break;
    }
  });

  return clearedValues;
}

export function sanitizeFormValuesForSkipLogic(
  values: FormValues,
  config: RegistrationConfig,
  initialFormValues?: FormValues,
): FormValues {
  if (!config) {
    return values;
  }

  const { fieldIds } = getHiddenElements(values, config);
  return clearHiddenFieldValues(values, fieldIds, config, initialFormValues?.address);
}
