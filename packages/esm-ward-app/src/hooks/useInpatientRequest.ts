import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { DispositionType, InpatientRequestFetchResponse } from '../types';
import useSWR from 'swr';
import useWardLocation from './useWardLocation';

const defaultRep =
  'custom:(dispositionLocation,dispositionType,disposition,dispositionEncounter:full,patient:default,dispositionObsGroup,visit)';

export function useInpatientRequest(dispositionType: Array<DispositionType> = ['ADMIT'], rep: string = defaultRep) {
  const { location } = useWardLocation();
  const searchParams = new URLSearchParams();
  searchParams.set('dispositionType', dispositionType.join(','));
  searchParams.set('dispositionLocation', location?.uuid);
  searchParams.set('v', rep);

  const { data, ...rest } = useSWR<FetchResponse<InpatientRequestFetchResponse>, Error>(
    location?.uuid ? `${restBaseUrl}/emrapi/inpatient/request?${searchParams.toString()}` : null,
    openmrsFetch,
  );

  return {
    inpatientRequests: data?.data?.results,
    ...rest,
  };
}
