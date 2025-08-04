import { getLocale } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useQueues } from './useQueues';
import uniqBy from 'lodash-es/uniqBy';
import { useServiceQueuesStore } from '../store/store';

function useQueueServices() {
  const { selectedQueueLocationUuid } = useServiceQueuesStore();
  const { queues, isLoading } = useQueues(selectedQueueLocationUuid);

  const results = useMemo(() => {
    const uniqueServices = uniqBy(
      queues.flatMap((queue) => queue.service),
      (service) => service?.uuid,
    );
    const sortedServices = uniqueServices.sort((a, b) => a.display.localeCompare(b.display, getLocale()));

    return {
      services: sortedServices,
      isLoadingQueueServices: isLoading,
    };
  }, [queues, isLoading]);

  return results;
}

export default useQueueServices;
