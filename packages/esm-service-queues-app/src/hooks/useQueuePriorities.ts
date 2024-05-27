import { type FetchResponse, openmrsFetch, restBaseUrl, isOfflineUuid } from '@openmrs/esm-framework';
import { type Concept } from '../types';
import useSWRImmutable from 'swr/immutable';
import { useSystemSetting } from './useSystemSetting';

interface QueuePrioritySystemSetting {
  uuid: string;
  property: string;
  value: string;
  description: string;
  display: string;
}

export function useQueuePriorities() {
  const {
    systemSetting,
    isLoading: isLoadingQueuePriorityConceptSetName,
    isValueUuid,
  } = useSystemSetting('queue.priorityConceptSetName');

  const queuePriorityConceptSetNameOrUuid = systemSetting?.value;

  const priorityConceptUrl = queuePriorityConceptSetNameOrUuid
    ? isValueUuid
      ? `${restBaseUrl}/concept/${queuePriorityConceptSetNameOrUuid}?v=custom:(uuid,display,setMembers:(display,uuid))`
      : `${restBaseUrl}/concept?q=${queuePriorityConceptSetNameOrUuid}&v=custom:(uuid,display,setMembers:(display,uuid))`
    : null;

  const {
    data: conceptResults,
    isLoading: isLoadingPriorities,
    ...rest
  } = useSWRImmutable<FetchResponse<Concept | { results: Array<Concept> }>>(priorityConceptUrl, openmrsFetch);

  return {
    priorities: isValueUuid
      ? (conceptResults?.data as Concept)?.setMembers
      : conceptResults?.data?.results?.[0]?.setMembers,
    isLoadingPriorities: isLoadingQueuePriorityConceptSetName || isLoadingPriorities,
    ...rest,
  };
}
