import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { DispositionType, InpatientRequestFetchResponse } from '../types';
import useSWR from 'swr';

const defaultRep =
  'custom:(dispositionLocation,dispositionType,disposition,dispositionEncounter:full,patient:default,dispositionObsGroup,visit)';

export function useInpatientRequest(
  locationUuid: string,
  dispositionType: Array<DispositionType> = ['ADMIT'],
  rep: string = defaultRep,
) {
  const searchParams = new URLSearchParams();
  searchParams.set('dispositionType', dispositionType.join(','));
  searchParams.set('dispositionLocation', locationUuid);
  searchParams.set('v', rep);

  const { data, ...rest } = useSWR<FetchResponse<InpatientRequestFetchResponse>, Error>(
    locationUuid ? `${restBaseUrl}/emrapi/inpatient/request?${searchParams.toString()}` : null,
    openmrsFetch,
  );

  return {
    inpatientRequests: data?.data?.results,
    ...rest,
  };
}
