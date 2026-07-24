import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';

export function useVisit(visitUuid?: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,certainty,voided),' +
    'form:(uuid,display,name,description,encounterType,version,resources:(uuid,display,name,valueReference)),encounterDatetime,' +
    // Use default representation for orders to safely include subclass-specific fields (e.g., DrugOrder)
    // without requesting properties that are not present on other subclasses (e.g., TestOrder).
    'orders,' +
    'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),' +
    'display,groupMembers:(uuid,concept:(uuid,display),' +
    'value:(uuid,display)),value),encounterType:(uuid,display),' +
    'encounterProviders:(uuid,display,encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime';

  const apiUrl = `${restBaseUrl}/visit/${visitUuid}?v=${customRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Visit }, Error>(
    visitUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    visit: data ? data.data : null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
