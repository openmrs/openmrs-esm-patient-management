import { openmrsFetch } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWR from 'swr';

// TODO: make a utility function in esm-core for unpacking the result
// from useSWR
export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria) {
  const searchParam = new URLSearchParams();
  for (let [key, value] of Object.entries(searchCriteria)) {
    searchParam.append(key, value.toString());
  }
  searchParam.append('v', 'full');

  const apiUrl = `/ws/rest/v1/queue-entry?` + searchParam.toString();
  const { data, ...rest } = useSWR<{ data: { results: Array<QueueEntry> } }, Error>(apiUrl, openmrsFetch);

  return {
    queueEntries: data?.data?.results,
    ...rest,
  };
}
