import { type Patient, type PersonAddress } from '@openmrs/esm-framework';
import { mockAddress } from './address.mock';
import { type AdmittedPatient } from '../packages/esm-ward-app/src/types';
import { mockPastVisit } from './visits.mock';
import { mockLocationInpatientWard } from './locations.mock';

/* Patients as returned by `usePatient` and the service queues endpoints */

export const mockPatientAlice: Patient = {
  uuid: '00000000-0000-0001-0000-000000000000',
  display: 'Alice Johnson',
  identifiers: [],
  person: {
    uuid: '00000000-0001-0000-0000-000000000000',
    display: 'Alice Johnson',
    gender: 'F',
    age: 24,
    birthdate: '2000-01-01T00:00:00.000+0000',
    birthdateEstimated: false,
    dead: false,
    deathDate: null,
    causeOfDeath: null,
    preferredName: {
      display: 'Alice Johnson',
      uuid: 'preferred-name-uuid',
    },
    preferredAddress: mockAddress as PersonAddress,
    names: [null],
    addresses: [],
    attributes: [],
    birthtime: null,
    deathdateEstimated: null,
    causeOfDeathNonCoded: null,
  },
};

export const mockPatientBrian: Patient = {
  uuid: '00000000-0000-0002-0000-000000000000',
  display: 'Brian Johnson',
  identifiers: [],
  person: {
    uuid: '00000000-0001-0000-0000-000000000000',
    display: 'Brian Johnson',
    gender: 'M',
    age: 24,
    birthdate: '2000-01-01T00:00:00.000+0000',
    birthdateEstimated: false,
    dead: false,
    deathDate: null,
    causeOfDeath: null,
    preferredName: null,
    preferredAddress: mockAddress as PersonAddress,
    names: [null],
    addresses: [],
    attributes: [],
    birthtime: null,
    deathdateEstimated: null,
    causeOfDeathNonCoded: null,
  },
};

export const mockAdmittedPatient: AdmittedPatient = {
  patient: mockPatientAlice,
  visit: mockPastVisit.data.results[0],
  currentLocation: mockLocationInpatientWard,
  timeAtInpatientLocationInMinutes: 100,
  timeSinceAdmissionInMinutes: 500,
};
