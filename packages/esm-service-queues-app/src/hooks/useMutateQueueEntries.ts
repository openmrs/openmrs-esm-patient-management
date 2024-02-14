import { useSWRConfig } from 'swr';

export function useMutateQueueEntries() {
  const { mutate } = useSWRConfig();
  const mutateQueueEntries = () =>
    mutate((key) => {
      return typeof key === 'string' && key.startsWith(`/ws/rest/v1/queue-entry`);
    });

  return {
    mutateQueueEntries,
  };
}
