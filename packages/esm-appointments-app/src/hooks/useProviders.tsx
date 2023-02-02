import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Provider } from '../types';

export function useProviders() {
  const apiUrl = `/ws/rest/v1/provider`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Provider> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    providers: data ? data.data?.results : [],
    isLoading,
    isError: error,
    isValidating,
  };
}
