import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { InpatientRequestFetchResponse } from '../types';
import useSWR from 'swr';

export function useInpatientRequest(locationUuid: string) {
  // prettier-ignore
  const customRepresentation =
    'custom:(dispositionType,' +
      'patient:(uuid,identifiers,voided,' +
        'person:(uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)))'
  const { data, ...rest } = useSWR<FetchResponse<InpatientRequestFetchResponse>, Error>(
    locationUuid
      ? `${restBaseUrl}/emrapi/inpatient/request?dispositionType=ADMIT,TRANSFER&dispositionLocation=${locationUuid}&v=${customRepresentation}`
      : null,
    openmrsFetch,
  );

  return {
    inpatientRequests: data?.data?.results,
    ...rest,
  };
}
