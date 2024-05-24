import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Bed, type BedStatus } from '../types/index';

interface BedSearchCriteria {
  locationUuid?: string;
  status?: BedStatus;
  bedType?: string;
}

export function useBeds(searchCriteria?: BedSearchCriteria) {
  const searchParam = new URLSearchParams();
  for (let [key, value] of Object.entries(searchCriteria)) {
    if (value != null) {
      searchParam.append(key, value?.toString());
    }
  }

  const apiUrl = `${restBaseUrl}/bed?${searchParam}`;
  const { data, ...rest } = useSWR<{ data: { results: Array<Bed> } }, Error>(apiUrl, openmrsFetch);

  return {
    beds: data?.data?.results ?? [],
    ...rest,
  };
}
