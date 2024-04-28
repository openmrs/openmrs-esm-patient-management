import { useMemo } from 'react';
import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, useSession } from '@openmrs/esm-framework';
import { useLocationHasChildren } from '../../hooks/useLocationHasChildren';

interface FHIRResponse {
  entry: Array<{ resource: fhir.Location }>;
  total: number;
  type: string;
  resourceType: string;
}

export function useQueueLocations(limitToSessionLocation: boolean = false) {
  const apiUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=queue location`;
  const { data, error, isLoading } = useSWR<{ data: FHIRResponse }>(apiUrl, openmrsFetch);

  const queueLocations = useMemo(
    () => data?.data?.entry?.map((response) => response.resource) ?? [],
    [data?.data?.entry],
  );

  const sessionLocation = useSession().sessionLocation;

  const { locationHasChildren: sessionLocationHasChildren, childLocations: sessionLocationChildren } =
    useLocationHasChildren(sessionLocation?.uuid);

  const sessionLocations = useMemo(() => {
    const locations = sessionLocationHasChildren ? [sessionLocation, ...sessionLocationChildren] : [sessionLocation];
    return locations.map((location) => ({ ...location, id: location?.uuid, name: location?.display }));
  }, []);

  return {
    queueLocations: limitToSessionLocation ? sessionLocations : queueLocations ? queueLocations : [],
    isLoading,
    error,
  };
}
