import { navigate } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import { MPIConfig, SearchedPatient } from '../types';

export function mapToOpenMRSPatient(fhirPatient: Partial<fhir.Patient>, mpiConfig: MPIConfig): SearchedPatient {
  if (!fhirPatient) {
    return null;
  }
  const identifierMap = {
    [mpiConfig.primaryOmrsIdentifierType]: 'internal',
    [mpiConfig.preferredPatientIdentifierType]: 'external-preferred',
  };
  return {
    uuid: null,
    identifiers: fhirPatient.identifier.map((id) => {
      return {
        identifier: id.value,
        identifierTypeOrientation: (identifierMap[id.type.coding[0]?.code] as any) || 'external',
      };
    }),
    person: {
      addresses: fhirPatient?.address?.map((address) => ({
        cityVillage: address.city,
        stateProvince: address.state,
        country: address.country,
        postalCode: address.postalCode,
        preferred: false,
        address1: '',
      })),
      age: null,
      birthdate: fhirPatient.birthDate,
      gender: capitalize(fhirPatient.gender),
      death: !fhirPatient.active,
      deathDate: '',
      personName: {
        display: `${fhirPatient.name[0].family} ${fhirPatient.name[0].given[0]}`,
        givenName: fhirPatient.name[0].given[0],
        familyName: fhirPatient.name[0].family,
        middleName: fhirPatient.name[0].given[1],
      },
    },
    attributes: [],
  };
}

export function getPreferredExternalHealthId(patient: SearchedPatient) {
  return patient.identifiers.find((identifier) => identifier.identifierTypeOrientation == 'external-preferred')
    ?.identifier;
}

export function doMPISearch(searchTerm: string) {
  navigate({
    to: '${openmrsSpaBase}/search?query=${searchTerm}&mode=external',
    templateParams: { searchTerm: searchTerm },
  });
}

export function isAssociatedWithOmrsId(patient: SearchedPatient) {
  return patient.identifiers.some((identifier) => identifier.identifierTypeOrientation == 'internal');
}

export function inferModeFromSearchParams(searchParams: URLSearchParams) {
  return searchParams?.get('mode')?.toLowerCase() == 'external' ? 'External' : 'Internal';
}
