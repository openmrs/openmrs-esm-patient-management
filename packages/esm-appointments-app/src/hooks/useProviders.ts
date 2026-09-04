import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Provider } from '../types';

export function useProviders(limit = 100) {
  const apiUrl = `${restBaseUrl}/provider?limit=${limit}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Provider> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    providers: data ? data.data?.results : [],
    isLoading,
    error,
    isValidating,
  };
}
