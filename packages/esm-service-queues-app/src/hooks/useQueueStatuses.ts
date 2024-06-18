import {
  type FetchResponse,
  OpenmrsResource,
  openmrsFetch,
  restBaseUrl,
  useOpenmrsSWR,
  getLocale,
} from '@openmrs/esm-framework';
import { useSystemSetting } from './useSystemSetting';
import { useMemo } from 'react';
import type { Concept } from '../types';
import useSWRImmutable from 'swr/immutable';
import { useQueues } from './useQueues';

function useQueueStatuses() {
  const { queues, isLoading } = useQueues();

  const results = useMemo(() => {
    const allStatuses = ([] as Array<Concept>).concat(...(queues ?? [])?.map((queue) => queue?.allowedStatuses));

    const uuidSet = new Set<string>();

    const statuses: Array<Concept> = [];

    allStatuses.forEach((status) => {
      if (!uuidSet.has(status.uuid)) {
        uuidSet.add(status.uuid);
        statuses.push(status);
      }
    });

    return {
      statuses: statuses.sort((a, b) => a.display.localeCompare(b.display, getLocale())),
      isLoadingQueueStatuses: isLoading,
    };
  }, [isLoading, queues]);

  return results;
}
export default useQueueStatuses;
