import { type InpatientAdmission } from '@openmrs/esm-ward-app/src/types';
import { mockEncounterAlice } from './encountes.mock';
import { mockPatientAlice } from './patient.mock';
import { mockVisitAlice } from './visits.mock';

export const mockInpatientAdmissionAlice: InpatientAdmission = {
  patient: mockPatientAlice,
  visit: mockVisitAlice,
  currentInpatientRequest: null,
  firstAdmissionOrTransferEncounter: mockEncounterAlice,
  encounterAssigningToCurrentInpatientLocation: mockEncounterAlice,
};
