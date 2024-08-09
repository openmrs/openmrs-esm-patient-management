import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Encounter, EncounterPayload } from './types';

export function createEncounter(encounterPayload: EncounterPayload) {
  return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: encounterPayload,
  });
}

export function assignPatientToBed(bedUuid: number, patientUuid: string, encounterUuid: string) {
  return openmrsFetch(`${restBaseUrl}/beds/${bedUuid}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: {
      patientUuid,
      encounterUuid,
    },
  });
}
