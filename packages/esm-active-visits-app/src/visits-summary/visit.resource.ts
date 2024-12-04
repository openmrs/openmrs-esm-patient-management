import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';

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

  const apiUrl = `${restBaseUrl}/visit/${visitUuid}?v=${customRepresentation}`;

  const { data, error, isLoading, isValidating } = useSWR<{ data: Visit }, Error>(
    visitUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    visit: data ? data.data : null,
    error,
    isLoading,
    isValidating,
  };
}

export function getDosage(strength: string, doseNumber: number) {
  if (!strength || !doseNumber) {
    return '';
  }

  const i = strength.search(/\D/);
  const strengthQuantity = parseInt(strength.substring(0, i));

  const concentrationStartIndex = strength.search(/\//);

  let strengthUnits = strength.substring(i);

  if (concentrationStartIndex >= 0) {
    strengthUnits = strength.substring(i, concentrationStartIndex);
    const j = strength.substring(concentrationStartIndex + 1).search(/\D/);
    const concentrationQuantity = parseInt(strength.substr(concentrationStartIndex + 1, j));
    const concentrationUnits = strength.substring(concentrationStartIndex + 1 + j);
    return `${doseNumber} ${strengthUnits} (${
      (doseNumber / strengthQuantity) * concentrationQuantity
    } ${concentrationUnits})`;
  } else {
    return `${strengthQuantity * doseNumber} ${strengthUnits}`;
  }
}
