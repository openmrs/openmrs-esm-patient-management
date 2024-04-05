import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type QueueEntry, type QueueEntrySearchCriteria } from '../types';
import useSWR from 'swr';

const repString =
  'custom:(uuid,display,queue,status,patient,visit:(uuid,display,encounters:(uuid,display,diagnoses,encounterDatetime,encounterType,obs,encounterProviders,voided)),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

export function useQueueEntries(searchCriteria?: QueueEntrySearchCriteria, rep: string = repString) {
  const searchParam = new URLSearchParams();
  for (let [key, value] of Object.entries(searchCriteria)) {
    if (value != null) {
      searchParam.append(key, value?.toString());
    }
  }

  searchParam.append('v', rep);
  searchParam.append('totalCount', 'true');

  const apiUrl = `${restBaseUrl}/queue-entry?` + searchParam.toString();
  const { data, ...rest } = useSWR<{ data: { results: Array<QueueEntry>; totalCount: number } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    queueEntries: data?.data?.results, // note that results can be paginated, thus, result.length != totalCount
    totalCount: data?.data?.totalCount,
    ...rest,
  };
}
