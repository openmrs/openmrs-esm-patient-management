import useSWR from 'swr';
import { type Observation } from '../types';
import { type Link, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

type QueueEntrySearchCriteria = Record<'patient', string> | Record<'encounter', string> | Record<'q', string>;

// TODO: right now, the obs endpoint can only take in one of "patient", "encounter" and "q' as param
// We should make it able to query by patient AND concept type
export function useObs(criteria?: QueueEntrySearchCriteria, representation = 'default', startIndex = 0) {
  const params = new URLSearchParams({
    ...criteria,
    v: representation,
    totalCount: 'true',
    startIndex: startIndex.toString(),
  });

  const apiUrl = `${restBaseUrl}/obs?${params}`;
  return useSWR<{ data: { results: Array<Observation>; totalCount: number; links: Array<Link> } }, Error>(
    apiUrl,
    openmrsFetch,
  );
}
