import { restBaseUrl } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';

export function useMutateQueueEntries() {
  const { mutate } = useSWRConfig();
  const mutateQueueEntries = () =>
    mutate((key) => {
      return typeof key === 'string' && key.startsWith(`${restBaseUrl}/queue-entry`);
    });

  return {
    mutateQueueEntries,
  };
}
