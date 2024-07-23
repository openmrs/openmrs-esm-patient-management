import type { AdmittedPatient, InpatientRequest } from '../packages/esm-ward-app/src/types';
import { mockLocationInpatientWard } from './locations.mock';
import { mockPatientAlice } from './patient.mock';
import { mockPastVisit } from './visits.mock';

export const mockInpatientRequest: InpatientRequest = {
  patient: mockPatientAlice,
  dispositionType: 'ADMIT',
};

export const mockAdmittedPatient: AdmittedPatient = {
  patient: mockPatientAlice,
  visit: mockPastVisit.data.results[0],
  currentLocation: mockLocationInpatientWard,
  timeAtInpatientLocationInMinutes: 100,
  timeSinceAdmissionInMinutes: 500,
};
