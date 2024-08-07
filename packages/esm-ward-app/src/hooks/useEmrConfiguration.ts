import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { type EmrApiConfigurationResponse } from '../types';

export default function useEmrConfiguration() {
  const swrData = useSWRImmutable<FetchResponse<EmrApiConfigurationResponse>>(
    `${restBaseUrl}/emrapi/configuration`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      emrConfiguration: swrData.data?.data,
      isLoadingEmrConfiguration: swrData.isLoading,
      mutateEmrConfiguration: swrData.mutate,
      errorFetchingEmrConfiguration: swrData.error,
    }),
    [swrData],
  );
  return results;
}
