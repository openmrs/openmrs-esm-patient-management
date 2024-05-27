import { type FetchResponse, OpenmrsResource, openmrsFetch, restBaseUrl, useOpenmrsSWR } from '@openmrs/esm-framework';
import { useSystemSetting } from './useSystemSetting';
import { useMemo } from 'react';
import type { Concept } from '../types';
import useSWRImmutable from 'swr/immutable';

function useQueueServices() {
  const {
    isLoading: isLoadingQueueServiceConceptNameUuid,
    systemSetting,
    isValueUuid,
  } = useSystemSetting('queue.serviceConceptSetName');

  const { data, isLoading: isLoadingQueueServices } = useSWRImmutable<
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
      services: isValueUuid
        ? (data?.data as Concept)?.setMembers
        : (data?.data as { results: Array<Concept> })?.results?.[0]?.setMembers,
      isLoadingQueueServices: isLoadingQueueServiceConceptNameUuid || isLoadingQueueServices,
    }),
    [data, isLoadingQueueServices, isLoadingQueueServiceConceptNameUuid, isValueUuid],
  );

  return results;
}
export default useQueueServices;
