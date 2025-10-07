import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Provider } from '../types';
import { type ConfigObject } from '../config-schema';

export function useProviders() {
  const apiUrl = `${restBaseUrl}/provider?v=custom:(display,person,uuid,retired,name,attributes:(display))`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Provider> } }, Error>(
    apiUrl,
    openmrsFetch,
  );
  const { filterProvidersByAppointmentSupportedEnabled } = useConfig<ConfigObject>();

  const allProviders = data ? data.data?.results : [];

  // Filter providers based on appointment support if enabled
  const filteredProviders = filterProvidersByAppointmentSupportedEnabled
    ? allProviders.filter((provider) => {
        return (
          provider.retired === false &&
          provider.attributes.some((attribute) => attribute.display === 'Available for appointments: true')
        );
      })
    : allProviders;

  return {
    providers: filteredProviders,
    isLoading,
    error,
    isValidating,
  };
}
