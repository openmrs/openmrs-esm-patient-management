import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import { visitCustomRepresentation } from '../constants';

export function usePastVisits(patientUuid: string, currentVisitUuid?: string) {
  const apiUrl = `${restBaseUrl}/visit?patient=${patientUuid}&v=${visitCustomRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    patientUuid ? apiUrl : null,
    openmrsFetch,
  );

  const previousVisit = data?.data?.results
    ?.filter(
      (result) => result.uuid !== currentVisitUuid && dayjs(result.startDatetime).isBefore(dayjs().startOf('day')),
    )
    ?.shift();

  return {
    visits: data ? previousVisit : null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
