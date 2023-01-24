import { navigate } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import { SearchedPatient } from '../types';

export function mapToOpenMRSPatient(
  fhirPatient: Partial<fhir.Patient>,
  prefferedExternalIdTitle: string,
): SearchedPatient {
  if (!fhirPatient) {
    return null;
  }
  return {
    uuid: null,
    identifiers: fhirPatient.identifier.map((id) => {
      return {
        identifier: id.value,
        isMPIRecordId: id.type.text.toLocaleLowerCase().includes(prefferedExternalIdTitle.toLocaleLowerCase()),
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

export function getExternalPatientHealthId(patient: SearchedPatient) {
  return patient.identifiers.find((identifier) => identifier.isMPIRecordId)?.identifier;
}

export function doMPISearch(searchTerm: string) {
  navigate({
    to: '${openmrsSpaBase}/search?query=${searchTerm}&mode=external',
    templateParams: { searchTerm: searchTerm },
  });
}

export function isAssociatedWithOMRSId(patient: SearchedPatient) {}
