import { type FetchResponse, openmrsFetch, restBaseUrl, useOpenmrsSWR } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { InpatientRequest } from '../types';

export function useInpatientRequest(locationUuid: string) {
  const { data, ...rest } = useSWR<FetchResponse<Array<InpatientRequest>>, Error>(
    locationUuid ? `${restBaseUrl}/emrapi/inpatient/admissionRequests?admissionLocation=${locationUuid}` : null,
  );

  return {
    inpatientRequests: data?.data,
    ...rest,
  };
}
