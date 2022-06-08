import { useMemo } from 'react';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface FHIRResponse {
  resourceType: string;
  id: string;
  meta: object;
  type: string;
  total: number;
  entry: Array<{ resource: fhir.Patient; fullUrl: string }>;
}

interface PatientReturnType {
  patients: Array<fhir.Patient>;
  isLoading: boolean;
  error: any;
}
/**
 * React hook that performs patient search using FHIR endpoint
 * @param query The search term which can be identifier or name
 * @param includeDead Whether to include dead patients in search results
 * @returns Object {patients,isLoading,error}
 */
const usePatients = (query: string, includeDead: boolean = false): PatientReturnType => {
  const url = `${fhirBaseUrl}/Patient?name=${query}&_summary=data${includeDead ? '&deceased=[true]' : ''}`;
  const { data, error } = useSWR<{ data: FHIRResponse }>(query?.length ? url : null, openmrsFetch);

  const searchPatient: Array<fhir.Patient> = useMemo(
    () => data?.data?.entry?.map(({ resource }) => resource) ?? [],
    [data?.data?.entry],
  );

  return { patients: searchPatient, isLoading: !data && !error, error: error };
};

export default usePatients;
