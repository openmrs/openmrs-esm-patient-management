import { SearchedPatient } from '../types';

export function mapToOpenMRSBundle(patientBundle: any): Array<SearchedPatient> {
  const buffer = [];
  if (!patientBundle || patientBundle.total == 0) {
    return buffer;
  }
  return patientBundle.entry.map(({ resource }) => mapToOpenMRSPatient(resource));
}

function mapToOpenMRSPatient(fhirPatient: Partial<fhir.Patient>): SearchedPatient {
  return {
    uuid: fhirPatient.id,
    identifiers: fhirPatient.identifier.map((id) => {
      if (id.system.includes('Health_ID')) {
        return {
          identifier: id.value,
          isMPIRecordId: true,
        };
      }
      return {
        identifier: id.value,
      };
    }),
    person: {
      addresses: [],
      age: null,
      birthdate: fhirPatient.birthDate,
      gender: fhirPatient.gender,
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

export function getPatientHealthId(patient: SearchedPatient) {
  return patient.identifiers.find((identifier) => identifier.isMPIRecordId).identifier;
}
