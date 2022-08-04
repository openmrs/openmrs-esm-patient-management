import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';

interface FHIRResponse {
  entry: Array<{ resource: fhir.Patient }>;
  total: number;
  type: string;
  resourceType: string;
}

const usePatients = (searchTerm: string) => {
  const { data, error } = useSWR<{ data: FHIRResponse }>(
    searchTerm !== null ? `${fhirBaseUrl}/Patient?name=${searchTerm}&_summary=data` : null,
    openmrsFetch,
  );

  const searchedPatients = useMemo(
    () => data?.data?.entry?.map((response) => response.resource) ?? [],
    [data?.data?.entry],
  );

  return { patients: searchedPatients, isLoading: !data && !error && searchTerm !== null, error };
};

export default usePatients;
