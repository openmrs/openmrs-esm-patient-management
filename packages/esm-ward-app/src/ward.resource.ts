import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { Encounter } from './types';

export function createEncounter(
  patientUuid: string,
  encounterTypeUuid: string,
  encounterLocation: string,
  encounterDetails: object = {},
) {
  return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: {
      ...encounterDetails,
      patient: patientUuid,
      encounterType: encounterTypeUuid,
      location: encounterLocation,
    },
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
