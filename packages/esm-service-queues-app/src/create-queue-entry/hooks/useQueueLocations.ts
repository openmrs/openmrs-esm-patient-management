import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { fhirBaseUrl, getLocale, openmrsFetch, restBaseUrl, useFhirFetchAll } from '@openmrs/esm-framework';

interface LocationWithParent {
  uuid: string;
  parentLocation?: LocationWithParent | null;
}

const ancestorRep =
  'custom:(uuid,parentLocation:(uuid,parentLocation:(uuid,parentLocation:(uuid,parentLocation:(uuid,parentLocation:(uuid))))))';

export function useQueueLocations(sessionLocationUuid?: string) {
  const sessionUrl = sessionLocationUuid ? `${restBaseUrl}/location/${sessionLocationUuid}?v=${ancestorRep}` : null;
  const { data: sessionData, isLoading: isLoadingSession } = useSWRImmutable<{ data: LocationWithParent }, Error>(
    sessionUrl,
    openmrsFetch,
  );
  let current = sessionData?.data;
  while (current?.parentLocation) {
    current = current.parentLocation;
  }

  const scopeUuid = current?.uuid ?? sessionLocationUuid;
  const baseUrl = `${fhirBaseUrl}/Location?_summary=data&_tag=queue location`;
  const descendantsUrl = scopeUuid ? `${baseUrl}&partof:below=${scopeUuid}` : baseUrl;
  const selfUrl = scopeUuid ? `${baseUrl}&_id=${scopeUuid}` : null;
  const {
    data: descendants,
    error: descendantsError,
    isLoading: isLoadingDescendants,
  } = useFhirFetchAll<fhir.Location>(descendantsUrl);
  const { data: self, error: selfError, isLoading: isLoadingSelf } = useFhirFetchAll<fhir.Location>(selfUrl);

  const queueLocations = useMemo(() => {
    const byId = new Map<string, fhir.Location>();
    for (const location of [...(self ?? []), ...(descendants ?? [])]) {
      if (location?.id && !byId.has(location.id)) {
        byId.set(location.id, location);
      }
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, getLocale()));
  }, [descendants, self]);

  return {
    queueLocations,
    isLoading: isLoadingSession || isLoadingDescendants || isLoadingSelf,
    error: descendantsError ?? selfError,
  };
}
