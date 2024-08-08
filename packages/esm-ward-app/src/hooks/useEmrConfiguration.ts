import { type FetchResponse, openmrsFetch, type OpenmrsResource, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

interface EmrApiConfigurationResponse {
  admissionEncounterType: OpenmrsResource;
  clinicianEncounterRole: OpenmrsResource;
  consultFreeTextCommentsConcept: OpenmrsResource;
  visitNoteEncounterType: OpenmrsResource;
  transferWithinHospitalEncounterType: OpenmrsResource;
  // There are many more keys to this object, but we only need these for now
  // Add more keys as needed
}

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
