import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function useMpiPatient(patientId: string) {
  const url = `${fhirBaseUrl}/Patient/${patientId}/$cr`;

  const {
    data: patient,
    error: error,
    isLoading: isLoading,
  } = useSWR<{ data: fhir.Patient }, Error>(url, openmrsFetch);

  return {
    isLoading,
    patient,
    error: error,
  };
}
