import useSWR from 'swr';
import { openmrsFetch, Visit } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export function usePastVisits(patientUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounters:(uuid,form:(uuid,display),encounterDatetime,' +
    'orders:full,' +
    'obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),' +
    'display,groupMembers:(uuid,concept:(uuid,display),' +
    'value:(uuid,display)),value),encounterType:(uuid,display),' +
    'encounterProviders:(uuid,display,encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient';

  const { data, error, isLoading, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `/ws/rest/v1/visit?patient=${patientUuid}&v=${customRepresentation}`,
    openmrsFetch,
  );

  const previousVisit = data?.data?.results
    ?.filter((result) => dayjs(result.startDatetime).isBefore(dayjs().startOf('day')))
    ?.shift();

  return {
    visits: data ? previousVisit : null,
    isError: error,
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
