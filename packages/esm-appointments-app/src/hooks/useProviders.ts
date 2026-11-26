import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type Provider } from '../types';

/**
 * Loads every provider, following the REST pagination links so sites with more
 * providers than the server page size still get the complete list.
 */
export function useProviders() {
  const apiUrl = `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))`;
  const { data, error, isLoading, isValidating } = useOpenmrsFetchAll<Provider>(apiUrl);

  return {
    providers: data ?? [],
    isLoading,
    error,
    isValidating,
  };
}
