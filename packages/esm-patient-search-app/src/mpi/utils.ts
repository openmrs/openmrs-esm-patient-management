import { type SearchedPatient } from '../types';
import { getCoreTranslation } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
export function inferModeFromSearchParams(searchParams: URLSearchParams): 'mpi' | null {
  return searchParams.get('mode')?.toLowerCase() === 'mpi' ? 'mpi' : null;
}

export function mapToOpenMRSPatient(fhirPatients: fhir.Bundle, nameTemplate: string): Array<SearchedPatient> {
  if (fhirPatients[0].total < 1) {
    return [];
  }
  //Consider patient // https://github.com/openmrs/openmrs-esm-core/blob/main/packages/framework/esm-api/src/types/patient-resource.ts
  const pts: Array<SearchedPatient> = [];

  fhirPatients[0].entry.forEach((pt, index) => {
    let fhirPatient = pt.resource;
    pts.push({
      externalId: fhirPatient.id,
      uuid: null,
      identifiers: null,
      person: {
        addresses: fhirPatient?.address?.map((address) => ({
          cityVillage: address.city,
          stateProvince: address.state,
          country: address.country,
          postalCode: address.postalCode,
          preferred: false,
          address1: address?.line && address.line.length > 0 ? address.line[0] : undefined,
        })),
        age: null,
        birthdate: fhirPatient.birthDate,
        gender: getCoreTranslation(fhirPatient.gender),
        dead: checkDeceased(fhirPatient),
        deathDate: fhirPatient.deceasedDateTime,
        personName: {
          display: formatName(fhirPatient, nameTemplate),
          givenName: fhirPatient.name[0].given[0],
          familyName: fhirPatient.name[0].family,
          middleName: fhirPatient.name[0].given[1],
        },
      },
      attributes: [],
    });
  });

  return pts;
}

export function checkDeceased(fhirPatient: fhir.Patient): boolean | null {
  if (fhirPatient.deceasedBoolean) {
    return true;
  }

  if (fhirPatient.deceasedDateTime) {
    const deceasedDate = dayjs(fhirPatient.deceasedDateTime);
    const currentDate = dayjs();

    if (deceasedDate.isBefore(currentDate) || deceasedDate.isSame(currentDate, 'day')) {
      return true;
    }
  }

  return null;
}

function formatNamex(fhirPatient: fhir.Patient, template: string) {
  const name = fhirPatient.name[0];

  const givenName = name.given ? name.given[0] : '';
  const familyName = name.family || '';
  const fullName = name.text || `${givenName} ${familyName}`;

  const formattedName = template
    .replace('{given}', givenName)
    .replace('{family}', familyName)
    .replace('{fullName}', fullName);

  return formattedName;
}

function formatName(fhirPatient: fhir.Patient, template: string): string {
  if (!fhirPatient?.name || fhirPatient.name.length === 0) {
    return '';
  }

  const name = fhirPatient.name[0];

  const givenName = name.given?.[0] ?? '';
  const familyName = name.family ?? '';
  const fullName = name.text ?? `${givenName} ${familyName}`.trim();

  return template.replace('{given}', givenName).replace('{family}', familyName).replace('{fullName}', fullName).trim();
}
