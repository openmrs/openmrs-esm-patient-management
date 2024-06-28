import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { InpatientRequest } from '../types';
import useSWRImmutable from 'swr/immutable';

//TODO:The api is still in implementation stage and this is just a placeholder for the api
export function useInpatientRequest(locationUuid: string) {
  const { data, ...rest } = useSWRImmutable<FetchResponse<Array<InpatientRequest>>, Error>(
    locationUuid ? `${restBaseUrl}/emrapi/inpatient/admissionRequests?admissionLocation=${locationUuid}` : null,
    openmrsFetch,
  );

  return {
    inpatientRequests: data?.data || null,
    ...rest,
  };
}
