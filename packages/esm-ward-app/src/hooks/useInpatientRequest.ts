import { openmrsFetch, restBaseUrl, useOpenmrsSWR } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { InpatientRequest } from '../types';

//TODO:The api is still in implementation stage and this is just a placeholder for the api
export function useInpatientRequest(locationUuid: string) {
  const { data, ...rest } = useOpenmrsSWR<Array<InpatientRequest>, Error>(
    locationUuid ? `${restBaseUrl}/emrapi/inpatient/admissionRequests?admissionLocation=${locationUuid}` : null,
    {
      swrConfig: {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnMount: false,
      },
    },
  );

  return {
    inpatientRequests: data?.data || null,
    ...rest,
  };
}
