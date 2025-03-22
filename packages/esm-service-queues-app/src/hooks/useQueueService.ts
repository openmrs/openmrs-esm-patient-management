import { useMemo } from 'react';
import { uniqBy } from 'lodash-es';
import { getLocale } from '@openmrs/esm-framework';
import { useQueues } from './useQueues';
import { useSelectedQueueLocationUuid } from '../helpers/helpers';

function useQueueServices() {
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { queues, isLoading } = useQueues(currentQueueLocation);

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
