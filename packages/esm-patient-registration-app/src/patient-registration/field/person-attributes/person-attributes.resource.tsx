import { FetchResponse, openmrsFetch, showToast } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { PersonAttributeTypeResponse } from '../../patient-registration-types';

export function usePersonAttributeType(personAttributeTypeUuid: string): {
  data: PersonAttributeTypeResponse;
  isLoading: boolean;
} {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<PersonAttributeTypeResponse>>(
    `/ws/rest/v1/personattributetype/${personAttributeTypeUuid}`,
    openmrsFetch,
  );
  if (error) {
    showToast({
      title: error.name,
      description: error.message,
      kind: 'error',
    });
  }
  return {
    data: data?.data,
    isLoading,
  };
}
