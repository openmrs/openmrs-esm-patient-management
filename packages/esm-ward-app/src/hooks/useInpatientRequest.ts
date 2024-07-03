import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { InpatientRequest } from '../types';
import useSWR from 'swr';

export function useInpatientRequest(locationUuid: string) {
  const { data, ...rest } = useSWR<FetchResponse<Array<InpatientRequest>>, Error>(
    locationUuid ? `${restBaseUrl}/emrapi/inpatient/admissionRequests?admissionLocation=${locationUuid}` : null,
    openmrsFetch,
  );

  return {
    inpatientRequests: data?.data,
    ...rest,
  };
}
