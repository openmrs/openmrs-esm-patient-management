import { type Patient, type PersonAddress } from '@openmrs/esm-framework';
import type { AdmittedPatient, InpatientRequest } from '../packages/esm-ward-app/src/types';
import { mockLocationInpatientWard } from './locations.mock';
import { mockPastVisit } from './visits.mock';
import { mockAddress } from './address.mock';
import { mockPatientAlice } from './patient.mock';

export const mockInpatientRequest: InpatientRequest = {
  patient: mockPatientAlice,
  dispositionType: 'ADMIT',
};
