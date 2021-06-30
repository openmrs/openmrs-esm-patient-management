import { FetchResponse, openmrsFetch, openmrsObservableFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { take, map } from 'rxjs/operators';

export interface ActiveVisitRow {
  id: string;
  wait: number;
  IDNumber: string;
  name: string;
  gender: string;
  age: string;
  visitType: string;
}

export function fetchActiveVisits() {
  const datetimeToday = new Date();
  datetimeToday.setUTCHours(0);
  datetimeToday.setUTCMinutes(0);
  datetimeToday.setUTCSeconds(0);
  datetimeToday.setUTCMilliseconds(0);
  const v =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)';
  return openmrsObservableFetch(
    `/ws/rest/v1/visit?includeInactive=false&fromStartDate=${datetimeToday.toISOString()}&v=${v}`,
    {
      headers: {
        contentType: 'application/json',
      },
    },
  )
    .pipe(take(1))
    .pipe(map((response: FetchResponse<{ results: Array<any> }>) => response.data));
}
