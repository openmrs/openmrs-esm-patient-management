import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';

export function usePastVisits(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,encounterDatetime,' +
    'form:(uuid,name),location:ref,' +
    'encounterType:ref,encounterProviders:(uuid,display,' +
    'provider:(uuid,display))),patient:(uuid,uuid),' +
    'visitType:(uuid,name,display),attributes:(uuid,display,value),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)';

  const apiUrl = `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`;
  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    patientUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    data: data ? data.data.results : null,
    isError: error,
    isLoading,
    isValidating,
  };
}
