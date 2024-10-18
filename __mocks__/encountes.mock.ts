import { type Encounter } from '../packages/esm-ward-app/src/types';
import { mockPatientAlice } from './patient.mock';
import { mockLocationSurgery } from './queue-entry.mock';
import { mockVisitAlice } from './visits.mock';

export const mockEncounterAlice: Encounter = {
  uuid: 'asdf',
  encounterDatetime: '2024-06-27T19:40:16.000+0000',
  patient: mockPatientAlice,
  location: mockLocationSurgery,
  encounterType: {
    uuid: 'asdf',
    description: 'admission',
  },
  obs: [],
  visit: mockVisitAlice,
};
