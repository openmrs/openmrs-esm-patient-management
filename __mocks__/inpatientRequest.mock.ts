import type { InpatientRequest } from '../packages/esm-ward-app/src/types';
import { mockPatientAlice } from './patient.mock';
import { mockPastVisit } from './visits.mock';

export const mockInpatientRequest: InpatientRequest = {
  patient: mockPatientAlice,
  visit: mockPastVisit.data.results[0],
  type: 'ADMISSION',
  encounter: null,
  dispositionObs: null,
  dispositionLocation: null,
  dispositionDate: null,
};
