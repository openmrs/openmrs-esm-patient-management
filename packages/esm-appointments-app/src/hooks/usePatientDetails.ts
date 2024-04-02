import { openmrsFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import { type PatientDetails } from '../types';
import useSWR from 'swr';

export function usePatientDetails(patientUuid: string, isEnabledQuery: boolean) {
  const abortController = new AbortController();
  const patientDetailsUrl = `${fhirBaseUrl}/Patient/${patientUuid}`;
  const fetcher = () =>
    openmrsFetch(patientDetailsUrl, {
      method: 'GET',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  const { data, error, isLoading } = useSWR<any, Error>(isEnabledQuery ? patientDetailsUrl : null, fetcher);

  let patientDetails: PatientDetails = {
    dateOfBirth: '',
  };
  patientDetails.dateOfBirth = data?.data?.birthDate;

  return {
    patientDetails: patientDetails,
  };
}
