import { openmrsFetch, Visit } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface Encounter {
  uuid: string;
  encounterDateTime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: Array<Observation>;
  orders: Array<Order>;
}

export interface EncounterProvider {
  uuid: string;
  display: string;
  encounterRole: {
    uuid: string;
    display: string;
  };
  provider: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
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

export interface Order {
  uuid: string;
  dateActivated: string;
  dose: number;
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
}

export interface Note {
  note: string;
  provider: {
    name: string;
    role: string;
  };
  time: string;
}

export interface OrderItem {
  order: Order;
  provider: {
    name: string;
    role: string;
  };
}

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
