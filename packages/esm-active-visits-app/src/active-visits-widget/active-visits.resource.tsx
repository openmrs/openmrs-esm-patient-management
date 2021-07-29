import { openmrsFetch, Visit } from '@openmrs/esm-framework';

export interface ActiveVisitRow {
  id: string;
  visitStartTime: string;
  IDNumber: string;
  name: string;
  gender: string;
  age: string;
  visitType: string;
  patientUuid: string;
  visitUuid: string;
}

export function fetchActiveVisits(abortController: AbortController) {
  const v =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)';
  return openmrsFetch<{ results: Visit[] }>(`/ws/rest/v1/visit?includeInactive=false&v=${v}`, {
    signal: abortController.signal,
  });
}
