import { createGlobalStore } from '@openmrs/esm-framework';
import { Patient } from '../patient-registration/patient-registration-types';
import { ClientRegistryPatient } from './patient-verification-types';

export function convertClientRegistryToOpenMRSPayload(clientRegistryPatient: ClientRegistryPatient): Patient {
  let patientPayload: Patient;

  return patientPayload;
}

export function convertOpenMRSPatientToClientRegistryPayload(patient: Patient): ClientRegistryPatient {
  const { person, identifiers } = patient;
  const names = person.names[0];
  const { addresses } = person;
  const clientRegistryPatient: ClientRegistryPatient = {
    clientExists: false,
    client: {
      clientNumber: '',
      firstName: names.givenName,
      middleName: names.middleName,
      lastName: names.familyName,
      dateOfBirth: person.birthdate,
      maritalStatus: '',
      gender: person.gender === 'M' ? 'male' : 'female',
      occupation: '',
      religion: '',
      educationLevel: '',
      country: 'KE',
      countyOfBirth: '',
      isAlive: !person.dead,
      originFacilityKmflCode: '',
      isOnART: '',
      nascopCCCNumber: identifiers.find((identifier) => identifier.uuid === '').identifier,
      residence: {
        county: '',
        subCounty: '',
        ward: '',
        village: '',
        landmark: '',
        address: '',
      },
      identifications: [],
      contact: { primaryPhone: '', secondaryPhone: '', emailAddress: '' },
      nextOfKins: [],
    },
  };
  return clientRegistryPatient;
}

export const clientRegistryStore = createGlobalStore<ClientRegistryPatient>('client-registry-store', {
  client: {} as any,
  clientExists: false,
});
