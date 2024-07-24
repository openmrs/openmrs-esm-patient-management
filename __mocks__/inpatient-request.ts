import { type Patient, type PersonAddress } from '@openmrs/esm-framework';
import type { AdmittedPatient, InpatientRequest } from '../packages/esm-ward-app/src/types';
import { mockLocationInpatientWard } from './locations.mock';
import { mockPastVisit } from './visits.mock';
import { mockAddress } from './address.mock';

// As received by `useInpatientRequest`
export const mockPatientAlice: Patient = {
  uuid: '00000000-0000-0001-0000-000000000000',
  identifiers: [],
  person: {
    uuid: '00000000-0000-0001-0000-00000asdfasd',
    display: 'Alice Johnson',
    gender: 'F',
    age: 24,
    birthdate: '2000-01-01T00:00:00.000+0000',
    birthtime: null,
    dead: false,
    deathDate: null,
    preferredName: null,
    preferredAddress: mockAddress as PersonAddress,
  },
};

export const mockInpatientRequest: InpatientRequest = {
  patient: mockPatientAlice,
  dispositionType: 'ADMIT',
};
