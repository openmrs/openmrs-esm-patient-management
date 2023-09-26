import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import { useMemo } from 'react';

interface FHIRResponse {
  entry: Array<{ resource: fhir.Patient }>;
  total: number;
  type: string;
  resourceType: string;
}

const usePatients = (searchTerm: string) => {
  const apiUrl = `${fhirBaseUrl}/Patient?name=${searchTerm}&_summary=data`;

  const { data, error, isLoading } = useSWR<{ data: FHIRResponse }>(searchTerm !== null ? apiUrl : null, openmrsFetch);

  const searchedPatients = useMemo(
    () => data?.data?.entry?.map((response) => response.resource) ?? [],
    [data?.data?.entry],
  );

  return { patients: searchedPatients, isLoading: isLoading && searchTerm !== null, error };
};

export default usePatients;
