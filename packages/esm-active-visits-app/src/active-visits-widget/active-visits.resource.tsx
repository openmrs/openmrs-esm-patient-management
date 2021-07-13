import { FetchResponse, openmrsFetch, openmrsObservableFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { take, map } from 'rxjs/operators';

export interface ActiveVisitRow {
  id: string;
  visitStartTime: string;
  IDNumber: string;
  name: string;
  gender: string;
  age: string;
  visitType: string;
  patientUuid: string;
}

export function fetchActiveVisits() {
  const v =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)';
  return openmrsObservableFetch(`/ws/rest/v1/visit?includeInactive=false&v=${v}`, {
    headers: {
      contentType: 'application/json',
    },
  })
    .pipe(take(1))
    .pipe(map((response: FetchResponse<{ results: Array<any> }>) => response.data));
}
