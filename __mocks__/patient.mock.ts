import type { Patient, PersonAddress } from '@openmrs/esm-framework';
import { mockAddress } from './address.mock';
import dayjs from 'dayjs';

const birthdate = '2000-01-01T00:00:00.000+0000';
const age = dayjs().diff(birthdate, 'years');

/* Patients as returned by `usePatient` and the service queues endpoints */
export const mockPatientAlice: Patient = {
  uuid: '00000000-0000-0001-0000-000000000000',
  display: 'Alice Johnson',
  identifiers: [],
  person: {
    uuid: '00000000-0001-0000-0000-000000000000',
    display: 'Alice Johnson',
    gender: 'F',
    age: age,
    birthdate: birthdate,
    birthdateEstimated: false,
    dead: false,
    deathDate: null,
    causeOfDeath: null,
    preferredName: {
      display: 'Alice Johnson',
      givenName: 'Alice',
      familyName: 'Johnson',
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
    age: age,
    birthdate: birthdate,
    birthdateEstimated: false,
    dead: false,
    deathDate: null,
    causeOfDeath: null,
    preferredAddress: mockAddress as PersonAddress,
    preferredName: {
      display: 'Brian Johnson',
      givenName: 'Brian ',
      familyName: 'Johnson',
      uuid: 'preferred-name-uuid',
    },
    names: [null],
    addresses: [],
    attributes: [],
    birthtime: null,
    deathdateEstimated: null,
    causeOfDeathNonCoded: null,
  },
};
