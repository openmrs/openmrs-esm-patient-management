import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface Location {
  uuid: string;
  display: string;
  tags: Array<{ uuid: string; display: string }>;
}

export function useIsQueueLocation(locationUuid: string) {
  const apiUrl = `${restBaseUrl}/location/${locationUuid}`;

  const { data, error, isLoading } = useSWR<{ data: Location }>(locationUuid ? apiUrl : null, openmrsFetch);
  const isQueueLocation = data?.data?.tags.some((tag) => tag.display === 'Queue Location');

  return {
    isQueueLocation: isQueueLocation ? true : false,
    error,
    isLoading,
  };
}
