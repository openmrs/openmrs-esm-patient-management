import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';

export function usePastVisits(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,encounterDatetime,' +
    'form:(uuid,name),location:ref,' +
    'encounterType:ref,encounterProviders:(uuid,display,' +
    'provider:(uuid,display))),patient:(uuid,uuid),' +
    'visitType:(uuid,name,display),attributes:(uuid,display,value),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)';

  const { data, error, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `/ws/rest/v1/visit?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    data: data ? data.data.results : null,
    isError: error,
    isLoading: !data && !error,
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
