import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';

export function usePastVisits(patientUuid: string, currentVisitUuid?: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,certainty,voided),form:(uuid,display),encounterDatetime,' +
    // Use default representation for orders to safely include subclass-specific fields (e.g., DrugOrder)
    // without requesting properties that are not present on other subclasses (e.g., TestOrder).
    'orders,' +
    'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),' +
    'display,groupMembers:(uuid,concept:(uuid,display),' +
    'value:(uuid,display)),value),encounterType:(uuid,display),' +
    'encounterProviders:(uuid,display,encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient';

  const apiUrl = `${restBaseUrl}/visit?patient=${patientUuid}&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
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
  };
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}
