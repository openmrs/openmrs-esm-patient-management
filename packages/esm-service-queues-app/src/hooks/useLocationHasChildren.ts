import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface Location {
  uuid: string;
  display: string;
  childLocations: Array<{ uuid: string; display: string }>;
}

export function useLocationHasChildren(locationUuid: string) {
  const apiUrl = `${restBaseUrl}/location/${locationUuid}`;

  const { data, isLoading, error } = useSWR<{ data: Location }>(apiUrl, openmrsFetch);

  const locationHasChildren = data?.data?.childLocations ? data?.data?.childLocations?.length > 0 : false;

  return {
    locationHasChildren,
    childLocations: locationHasChildren ? data?.data?.childLocations : [],
    isLoading,
    error,
  };
}
