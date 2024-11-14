import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';

export function useMpiPatient(patientId: string) {
  const url = `${fhirBaseUrl}/Patient/${patientId}/$cr`;

  const { data, error, isLoading } = useSWR<{ data: fhir.Patient }, Error>(url, openmrsFetch);

  return {
    errorLoadingMpiPatient: error,
    isLoadingMpiPatient: isLoading,
    mpiPatient: data?.data,
  };
}
