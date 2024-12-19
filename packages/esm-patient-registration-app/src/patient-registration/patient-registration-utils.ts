import * as Yup from 'yup';
import camelCase from 'lodash-es/camelCase';
import { openmrsFetch, restBaseUrl, parseDate } from '@openmrs/esm-framework';
import {
  type AddressValidationSchemaType,
  type Encounter,
  type FormValues,
  type PatientIdentifier,
  type PatientIdentifierValue,
  type PatientUuidMapType,
} from './patient-registration.types';

export function parseAddressTemplateXml(addressTemplate: string) {
  const templateXmlDoc = new DOMParser().parseFromString(addressTemplate, 'text/xml');
  const nameMappings = templateXmlDoc.querySelector('nameMappings');
  const properties = nameMappings.getElementsByTagName('entry');
  const validationSchemaObjs = Array.prototype.map.call(properties, (property: Element) => {
    const name = property.getElementsByTagName('string')[0].innerHTML;
    const label = property.getElementsByTagName('string')[1].innerHTML;
    const regex = findElementValueInXmlDoc(name, 'elementRegex', templateXmlDoc) || '.*';
    const regexFormat = findElementValueInXmlDoc(name, 'elementRegexFormats', templateXmlDoc) || '';

    return {
      name,
      label,
      regex,
      regexFormat,
    };
  });

  const addressValidationSchema = Yup.object(
    validationSchemaObjs.reduce((final, current) => {
      final[current.name] = Yup.string().matches(current.regex, current.regexFormat);
      return final;
    }, {}),
  );

  const addressFieldValues = Array.prototype.map.call(properties, (property: Element) => {
    const name = property.getElementsByTagName('string')[0].innerHTML;
    return {
      name,
      defaultValue: '',
    };
  });
  return {
    addressFieldValues,
    addressValidationSchema,
  };
}

export function parseAddressTemplateXmlOld(addressTemplate: string) {
  const templateXmlDoc = new DOMParser().parseFromString(addressTemplate, 'text/xml');
  const nameMappings = templateXmlDoc.querySelector('nameMappings').querySelectorAll('property');
  const validationSchemaObjs: AddressValidationSchemaType[] = Array.prototype.map.call(
    nameMappings,
    (nameMapping: Element) => {
      const name = nameMapping.getAttribute('name');
      const label = nameMapping.getAttribute('value');
      const regex = findElementValueInXmlDoc(name, 'elementRegex', templateXmlDoc) || '.*';
      const regexFormat = findElementValueInXmlDoc(name, 'elementRegexFormats', templateXmlDoc) || '';

      return {
        name,
        label,
        regex,
        regexFormat,
      };
    },
  );

  const addressValidationSchema = Yup.object(
    validationSchemaObjs.reduce((final, current) => {
      final[current.name] = Yup.string().matches(current.regex, current.regexFormat);
      return final;
    }, {}),
  );

  const addressFieldValues: Array<{ name: string; defaultValue: string }> = Array.prototype.map.call(
    nameMappings,
    (nameMapping: Element) => {
      const name = nameMapping.getAttribute('name');
      const defaultValue = findElementValueInXmlDoc(name, 'elementDefaults', templateXmlDoc) ?? '';
      return { name, defaultValue };
    },
  );

  return {
    addressFieldValues,
    addressValidationSchema,
  };
}

function findElementValueInXmlDoc(fieldName: string, elementSelector: string, doc: XMLDocument) {
  return doc.querySelector(elementSelector)?.querySelector(`[name=${fieldName}]`)?.getAttribute('value') ?? null;
}

export function scrollIntoView(viewId: string) {
  document.getElementById(viewId).scrollIntoView({
    behavior: 'smooth',
    block: 'center',
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
  result.additionalGivenName = additionalPatientName?.given?.[0] ?? undefined;
  result.additionalMiddleName = additionalPatientName?.given?.[1] ?? undefined;
  result.additionalFamilyName = additionalPatientName?.family ?? undefined;

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

export function getPatientIdentifiersFromFhirPatient(patient: fhir.Patient): Array<PatientIdentifier> {
  return patient.identifier.map((identifier) => {
    return {
      uuid: identifier.id,
      identifier: identifier.value,
    };
  });
}

export async function getIdentifierFieldValuesFromFhirPatient(
  patient: fhir.Patient,
  identifierConfig,
): Promise<{ [identifierFieldName: string]: PatientIdentifierValue }> {
  const identifiers: FormValues['identifiers'] = {};
  const promises: Promise<void>[] = [];

  for (const identifier of patient.identifier) {
    for (const config of identifierConfig) {
      if (config.identifierTypeSystem !== identifier.system) {
        continue;
      }

      const url = `${restBaseUrl}/patientidentifiertype/${config.identifierTypeUuid}`;

      promises.push(
        openmrsFetch(url)
          .then((response) => {
            if (!response.data?.name) {
              return;
            }
            identifiers[response.data.name] = {
              identifierUuid: null,
              preferred: false,
              initialValue: identifier.value,
              identifierValue: identifier.value,
              identifierTypeUuid: config.identifierTypeUuid,
              identifierName: response.data.name,
              required: false,
              selectedSource: null,
              autoGeneration: false,
            };
          })
          .catch((error) => {
            console.error(`Error fetching identifier type for ${config.identifierTypeUuid}:`, error);
          }),
      );
    }
  }
  await Promise.all(promises);
  return identifiers;
}

export function getPhonePersonAttributeValueFromFhirPatient(patient: fhir.Patient, phoneUuid) {
  const result = {};

  if (patient.telecom && Array.isArray(patient.telecom)) {
    const phoneEntry = patient.telecom.find((entry) => entry.system === 'phone');
    if (phoneEntry) {
      result[phoneUuid] = phoneEntry.value;
    }
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
