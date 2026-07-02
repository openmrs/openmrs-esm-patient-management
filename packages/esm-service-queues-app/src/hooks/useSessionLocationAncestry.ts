import { useMemo } from 'react';
import { fhirBaseUrl, useFhirFetchAll } from '@openmrs/esm-framework';

/**
 * Returns the given location and its ancestors (via FHIR `Location:partof`) as an ordered list of
 * UUIDs, from the location itself up to the root. If the server doesn't support `_include:iterate`,
 * only the location itself is returned.
 */
export function useSessionLocationAncestry(locationUuid?: string) {
  const url = locationUuid
    ? `${fhirBaseUrl}/Location?_id=${locationUuid}&_include:iterate=Location:partof&_summary=data`
    : null;
  const { data, isLoading, error } = useFhirFetchAll<fhir.Location>(url);

  const ancestry = useMemo(() => {
    if (!locationUuid || !data?.length) {
      return [] as Array<string>;
    }
    const locationsById = new Map(data.map((location) => [location.id, location]));
    const chain: Array<string> = [];
    const visited = new Set<string>();
    let current: string | undefined = locationUuid;
    while (current && locationsById.has(current) && !visited.has(current)) {
      visited.add(current);
      chain.push(current);
      current = locationsById.get(current)?.partOf?.reference?.split('/').pop();
    }
    return chain;
  }, [data, locationUuid]);

  return { ancestry, isLoading, error };
}
