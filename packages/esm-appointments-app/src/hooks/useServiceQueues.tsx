import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useServiceQueues = () => {
  const apiUrl = `/ws/rest/v1/visit-queue-entry?v=full`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<any> } }, Error>(
    apiUrl,
    openmrsFetch,
  );
  return { isLoading, queueEntries: data?.data?.results ?? [], isValidating };
};
