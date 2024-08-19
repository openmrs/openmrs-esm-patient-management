import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { DispositionType, InpatientRequestFetchResponse } from '../types';
import useSWR from 'swr';
import useWardLocation from './useWardLocation';
import { useMemo } from 'react';

// prettier-ignore
const defaultRep =
  'custom:(' +
    'dispositionLocation,' +
    'dispositionType,' +
    'disposition,' +
    'dispositionEncounter:full,' +
    'patient:(uuid,identifiers,voided,' +
      'person:(uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)),' + 
    'dispositionObsGroup,' +
    'visit)';

export function useInpatientRequest(
  dispositionType: Array<DispositionType> = ['ADMIT', 'TRANSFER'],
  rep: string = defaultRep,
) {
  const { location } = useWardLocation();
  const searchParams = new URLSearchParams();
  searchParams.set('dispositionType', dispositionType.join(','));
  searchParams.set('dispositionLocation', location?.uuid);
  searchParams.set('v', rep);

  const { data, ...rest } = useSWR<FetchResponse<InpatientRequestFetchResponse>, Error>(
    location?.uuid ? `${restBaseUrl}/emrapi/inpatient/request?${searchParams.toString()}` : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      inpatientRequests: data?.data?.results,
      ...rest,
    }),
    [data, rest],
  );

  return results;
}
