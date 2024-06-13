import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { InpatientRequest } from '../types';

//The api is still in implementation stage and this is just a placeholder for the api
export function useInpatientRequest(locationUuid: string) {
  const apiUrl = `${restBaseUrl}/emrapi/inpatient/admissionRequests?admissionLocation=${locationUuid}`;
  const { data, ...rest } = useSWR<{ data: Array<InpatientRequest> }, Error>(apiUrl, openmrsFetch);

  return {
    inpatientRequests: data?.data || null,
    ...rest,
  };
}
