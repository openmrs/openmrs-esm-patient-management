import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Concept } from '../types';
import useSWRImmutable from 'swr/immutable';
import { useSystemSetting } from './useSystemSetting';

export function useQueueStatuses() {
  const {
    systemSetting,
    isLoading: isLoadingQueueStatusConceptSetName,
    isValueUuid,
  } = useSystemSetting('queue.statusConceptSetName');
  const queueStatusConceptSetName = systemSetting?.value;

  const statusConceptUrl = queueStatusConceptSetName
    ? isValueUuid
      ? `${restBaseUrl}/concept/${queueStatusConceptSetName}?v=custom:(uuid,display,setMembers:(display,uuid))`
      : `${restBaseUrl}/concept?q=${queueStatusConceptSetName}&v=custom:(uuid,display,setMembers:(display,uuid))`
    : null;

  const {
    data: conceptResults,
    isLoading: isLoadingStatuses,
    ...rest
  } = useSWRImmutable<FetchResponse<{ results: Array<Concept> } | Concept>>(statusConceptUrl, openmrsFetch);

  return {
    statuses: isValueUuid
      ? (conceptResults?.data as Concept)?.setMembers
      : conceptResults?.data?.results?.[0]?.setMembers,
    isLoadingStatuses: isLoadingQueueStatusConceptSetName || isLoadingStatuses,
    ...rest,
  };
}
