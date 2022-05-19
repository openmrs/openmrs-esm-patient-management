import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';

export function useVisit(visitUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,encounterDatetime,' +
    'orders:(uuid,dateActivated,' +
    'drug:(uuid,name,strength),doseUnits:(uuid,display),' +
    'dose,route:(uuid,display),frequency:(uuid,display),' +
    'duration,durationUnits:(uuid,display),numRefills,' +
    'orderType:(uuid,display),orderer:(uuid,person:(uuid,display))),' +
    'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),' +
    'display,groupMembers:(uuid,concept:(uuid,display),' +
    'value:(uuid,display)),value),encounterType:(uuid,display),' +
    'encounterProviders:(uuid,display,encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime';

  const { data, error, isValidating } = useSWR<{ data: Visit }, Error>(
    `/ws/rest/v1/visit/${visitUuid}?v=${customRepresentation}`,
    openmrsFetch,
  );

  return {
    visit: data ? data.data : null,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}

export function calculateBMI(weight: number, height: number): number {
  if (!weight || !height) {
    return;
  }

  if (weight > 0 && height > 0) {
    return Number((weight / (height / 100) ** 2).toFixed(1));
  }
}
