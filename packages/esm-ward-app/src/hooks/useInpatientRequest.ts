import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { InpatientRequest } from '../types';

export function useInpatientRequest(locationUuid: string) {
  const apiUrl = `/ws/rest/emrapi/inpatient/admissionRequests?admissionLocation=${locationUuid}`;
  const { data, ...rest } = useSWR<{ data: Array<InpatientRequest> }, Error>(apiUrl, openmrsFetch);

  return {
    inpatientRequests: data?.data || null,
    ...rest,
  };
}
