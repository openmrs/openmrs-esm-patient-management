import { navigate } from '@openmrs/esm-framework';
import * as Yup from 'yup';
import { AddressValidationSchemaType, FormValues, PatientUuidMapType } from './patient-registration-types';
import camelCase from 'lodash-es/camelCase';
import capitalize from 'lodash-es/capitalize';

export function parseAddressTemplateXml(addressTemplate: string) {
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
  navigate({ to: `${window.spaBase}/home` });
}

export function getFormValuesFromFhirPatient(patient: fhir.Patient) {
  const result = {} as FormValues;
  const patientName = patient.name[0];
  const additionalPatientName = patient.name[1];

  result.givenName = patientName?.given[0];
  result.middleName = patientName?.given[1];
  result.familyName = patientName?.family;
  result.unidentifiedPatient =
    patientName.given[0] === 'UNKNOWN' && patientName.family === 'unknown' ? true : undefined;

  result.addNameInLocalLanguage = !!additionalPatientName ? true : undefined;
  result.additionalGivenName = additionalPatientName?.given[0];
  result.additionalMiddleName = additionalPatientName?.given[1];
  result.additionalFamilyName = additionalPatientName?.family;

  result.gender = capitalize(patient.gender);
  result.birthdate = patient.birthDate ? (new Date(patient.birthDate) as any) : undefined;
  result.telephoneNumber = patient.telecom ? patient.telecom[0].value : '';

  if (patient.deceasedBoolean || patient.deceasedDateTime) {
    result.isDead = true;
    result.deathDate = patient.deceasedDateTime ? patient.deceasedDateTime.split('T')[0] : '';
  }

  const identifiers = {};
  for (const identifier of patient.identifier) {
    const fieldName = camelCase(identifier.system || identifier.type.text);
    identifiers[fieldName] = identifier.value;
  }

  return {
    ...result,
    identifiers,
  } as FormValues;
}

export function getAddressFieldValuesFromFhirPatient(patient: fhir.Patient) {
  const result = {};
  const address = patient.address?.[0];

  if (address) {
    for (const [key, value] of Object.entries(address)) {
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
    patientUuid: patient.id,
    preferredNameUuid: patientName?.id,
    additionalNameUuid: additionalPatientName?.id,
    preferredAddressUuid: address?.id,
    ...patient.identifier.map((identifier) => {
      const key = camelCase(identifier.system || identifier.type.text);
      return { [key]: { uuid: identifier.id, value: identifier.value } };
    }),
  };
}
