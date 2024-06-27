import useSWR from 'swr';
import { type Observation } from '../types';
import { type Link, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface ObsSearchCriteria {
  patient: string;
  concept: string;
}

export function useObs(criteria?: ObsSearchCriteria, representation = 'default') {
  const params = new URLSearchParams({
    ...criteria,
    v: representation,
  });

  const apiUrl = `${restBaseUrl}/obs?${params}`;
  return useSWR<{ data: { results: Array<Observation>; totalCount: number; links: Array<Link> } }, Error>(
    apiUrl,
    openmrsFetch,
  );
}
