import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PersonAttribute, PersonAttributeTypeResponse } from '../../patient-registration-types';

export function usePersonAttributeType(personAttributeTypeUuid: string) {
  const swrResult = useSWR<FetchResponse<PersonAttributeTypeResponse>>(
    `/ws/rest/v1/personattributetype/${personAttributeTypeUuid}`,
    openmrsFetch,
  );
  return {
    data: swrResult.data?.data,
    isLoading: !swrResult.data,
  };
}
