import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type PatientNotePayload } from '../../../types';

export function savePatientNote(abortController: AbortController, payload: PatientNotePayload) {
  return openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}
