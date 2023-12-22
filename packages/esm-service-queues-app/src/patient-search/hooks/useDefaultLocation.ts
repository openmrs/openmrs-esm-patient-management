import { type FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export const useDefaultLoginLocation = () => {
  const config = useConfig();
  const apiUrl = config.defaultFacilityUrl;
  const { data, error, isLoading } = useSWRImmutable<FetchResponse>(apiUrl, openmrsFetch);

  return {
    defaultFacility: data ? data?.data : null,
    isLoading: isLoading,
    isError: error,
  };
};
