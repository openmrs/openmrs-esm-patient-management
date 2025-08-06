import { useMemo } from 'react';
import { fhirBaseUrl, getLocale, useFhirFetchAll } from '@openmrs/esm-framework';

export function useQueueLocations() {
  const apiUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=queue location`;
  const { data, error, isLoading } = useFhirFetchAll<fhir.Location>(apiUrl);

  const queueLocations = useMemo(
    () => data?.map((response) => response).sort((a, b) => a.name.localeCompare(b.name, getLocale())) ?? [],
    [data],
  );

  return { queueLocations, isLoading, error };
}
