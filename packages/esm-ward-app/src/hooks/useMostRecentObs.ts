import useSWR from 'swr';
import { type Observation } from '../types';
import { type Link, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface ObsSearchCriteria {
  patient: string;
  concept: string;
}

export function useMostRecentObs(criteria?: ObsSearchCriteria, representation = 'default') {
  const params = new URLSearchParams({
    ...criteria,
    v: representation,
    limit: '1',
  });

  const apiUrl = `${restBaseUrl}/obs?${params}`;

  const { data, ...rest } = useSWR<{ data: { results: Array<Observation>; totalCount: number; links: Array<Link> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const obs = data?.data?.results?.[0];

  return { data: obs, ...rest };
}
