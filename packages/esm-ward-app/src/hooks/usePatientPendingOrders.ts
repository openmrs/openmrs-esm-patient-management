import { type FetchResponse, openmrsFetch, type OpenmrsResource, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function usePatientPendingOrders(patientUuid: string, orderTypeUUid: string, visitStartDate: string) {
  const apiUrl =
    patientUuid && orderTypeUUid && visitStartDate
      ? `${restBaseUrl}/order?includeNullFulfillerStatus=true&patient=${patientUuid}&orderTypes=${orderTypeUUid}&activatedOnOrAfterDate=${visitStartDate}`
      : null;
  const { data, ...rest } = useSWR<FetchResponse<{ results: Array<OpenmrsResource> }>, Error>(apiUrl, openmrsFetch);

  return {
    orders: data?.data.results,
    count: data?.data.results.length,
    ...rest,
  };
}
