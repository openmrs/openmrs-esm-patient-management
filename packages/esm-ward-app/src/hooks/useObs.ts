import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type Observation } from '../types';

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
  return useOpenmrsFetchAll<Observation>(apiUrl);
}
