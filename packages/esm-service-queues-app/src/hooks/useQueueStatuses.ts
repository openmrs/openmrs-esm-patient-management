import { type FetchResponse, OpenmrsResource, openmrsFetch, restBaseUrl, useOpenmrsSWR } from '@openmrs/esm-framework';
import { useSystemSetting } from './useSystemSetting';
import { useMemo } from 'react';
import type { Concept } from '../types';
import useSWRImmutable from 'swr/immutable';

function useQueueStatuses() {
  const {
    isLoading: isLoadingStatusConceptNameUuid,
    systemSetting,
    isValueUuid,
  } = useSystemSetting('queue.statusConceptSetName');

  const { data, isLoading: isLoadingQueueStatuses } = useSWRImmutable<
    FetchResponse<Concept | { results: Array<Concept> }>
  >(
    systemSetting?.value
      ? isValueUuid
        ? `${restBaseUrl}/concept/${systemSetting?.value}`
        : `${restBaseUrl}/concept?q=${systemSetting?.value}`
      : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      statuses: isValueUuid
        ? (data?.data as Concept)?.setMembers
        : (data?.data as { results: Array<Concept> })?.results?.[0]?.setMembers,
      isLoadingQueueStatuses: isLoadingStatusConceptNameUuid || isLoadingQueueStatuses,
    }),
    [data, isLoadingQueueStatuses, isLoadingStatusConceptNameUuid, isValueUuid],
  );

  return results;
}
export default useQueueStatuses;
