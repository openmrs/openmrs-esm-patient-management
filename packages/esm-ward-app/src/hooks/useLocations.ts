import { type FetchResponse, fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { useEffect, useMemo, useState } from 'react';
import useSWRImmutable from 'swr/immutable';

interface FhirLocation {
  fullUrl: string;
  resource: {
    resourceType: 'Location';
    id: string;
    name: string;
    description: string;
  };
}

interface FhirResponse {
  resourceType: 'Bundle';
  id: '6a107c31-d760-4df0-bb70-89ad742225ca';
  meta: {
    lastUpdated: '2024-08-08T06:28:01.495+00:00';
  };
  type: 'searchset';
  total: number;
  link: Array<{
    relation: 'self' | 'prev' | 'next';
    url: string;
  }>;
  entry: Array<FhirLocation>;
}

export default function useLocations(filterCriteria: Array<Array<string>> = [], skip: boolean = false) {
  const [totalLocations, setTotalLocations] = useState(0);
  const [url, setUrl] = useState(`${fhirBaseUrl}/Location`);
  const searchParams = new URLSearchParams(filterCriteria);
  const urlWithSearchParams = `${url}?${searchParams.toString()}`;
  const { data, ...rest } = useSWRImmutable<FetchResponse<FhirResponse>>(
    !skip ? urlWithSearchParams : null,
    openmrsFetch,
  );

  useEffect(() => {
    if (data?.data) {
      setTotalLocations(data.data.total);
    }
  }, [data]);

  const results = useMemo(() => {
    return {
      locations: data?.data?.entry?.map((entry) => entry.resource),
      totalLocations,
      ...rest,
    };
  }, [data, rest, totalLocations]);
  return results;
}
