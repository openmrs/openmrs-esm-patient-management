import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import type {
  AdmissionLocation,
  Bed,
  BedFetchResponse,
  BedTagData,
  BedTagPayload,
  BedType,
  BedTypePayload,
  LocationFetchResponse,
  MappedBedData,
} from '../types';
import { type BedManagementConfig } from '../config-schema';

export const useLocationsWithAdmissionTag = () => {
  const { admissionLocationTagName } = useConfig<BedManagementConfig>();
  const locationsUrl = `${restBaseUrl}/location?tag=${admissionLocationTagName}&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<LocationFetchResponse, Error>(
    admissionLocationTagName ? locationsUrl : null,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      admissionLocations: data?.data?.results ?? [],
      errorLoadingAdmissionLocations: error,
      isLoadingAdmissionLocations: isLoading,
      isValidatingAdmissionLocations: isValidating,
      mutateAdmissionLocations: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return results;
};

export const useBedsForLocation = (locationUuid: string) => {
  const apiUrl = `${restBaseUrl}/bed?locationUuid=${locationUuid}&v=full`;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<Bed> } }, Error>(
    locationUuid ? apiUrl : null,
    openmrsFetch,
  );

  const mappedBedData: MappedBedData = (data?.data?.results ?? []).map((bed) => ({
    description: bed.bedType?.description,
    id: bed.id,
    name: bed.bedType?.displayName,
    number: bed.bedNumber,
    status: bed.status,
    uuid: bed.uuid,
  }));

  const results = useMemo(
    () => ({
      bedsData: mappedBedData,
      errorLoadingBeds: error,
      isLoadingBeds: isLoading,
    }),
    [mappedBedData, isLoading, error],
  );

  return results;
};

export const useLocationName = (locationUuid: string) => {
  const { admissionLocations, isLoadingAdmissionLocations } = useLocationsWithAdmissionTag();
  const matchingLocation = admissionLocations.find((location) => location.uuid === locationUuid);

  const results = useMemo(
    () => ({
      name: matchingLocation?.display ?? null,
      isLoadingLocationData: isLoadingAdmissionLocations,
    }),
    [matchingLocation, isLoadingAdmissionLocations],
  );

  return results;
};

export function useBedsGroupedByLocation() {
  const { admissionLocations, isLoadingAdmissionLocations } = useLocationsWithAdmissionTag();

  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [result, setResult] = useState([]);

  useEffect(() => {
    let isSubscribed = true;
    if (!isLoadingAdmissionLocations && admissionLocations && isValidating) {
      const fetchData = async () => {
        const promises = admissionLocations.map(async (location) => {
          const bedsUrl = `${restBaseUrl}/bed?locationUuid=${location.uuid}`;
          const bedsFetchResult = await openmrsFetch<BedFetchResponse>(bedsUrl, {
            method: 'GET',
          });
          if (bedsFetchResult.data.results.length) {
            return bedsFetchResult.data.results.map((bed) => ({
              ...bed,
              location: location,
            }));
          }
          return null;
        });

        const updatedWards = (await Promise.all(promises)).filter(Boolean);
        if (isSubscribed) {
          setResult(updatedWards);
        }
      };
      fetchData()
        .catch((error) => {
          if (isSubscribed) {
            setError(error);
          }
        })
        .finally(() => {
          if (isSubscribed) {
            setIsLoading(false);
            setIsValidating(false);
          }
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [admissionLocations, isLoadingAdmissionLocations, isValidating]);

  const mutate = useCallback(() => {
    setIsValidating(true);
  }, []);

  const results = useMemo(
    () => ({
      bedsGroupedByLocation: result,
      errorFetchingBedsGroupedByLocation: error,
      isLoadingBedsGroupedByLocation: isLoading || isLoadingAdmissionLocations,
      isValidatingBedsGroupedByLocation: isValidating,
      mutateBedsGroupedByLocation: mutate,
    }),
    [error, isLoading, isLoadingAdmissionLocations, isValidating, mutate, result],
  );

  return results;
}

export const useAdmissionLocations = () => {
  const locationsUrl = `${restBaseUrl}/admissionLocation?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { data: { results: Array<AdmissionLocation> } },
    Error
  >(locationsUrl, openmrsFetch);

  const results = useMemo(
    () => ({
      data: data?.data?.results ?? [],
      error,
      isLoading,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return results;
};

export const useAdmissionLocationBedLayout = (locationUuid: string) => {
  const locationsUrl = `${restBaseUrl}/admissionLocation/${locationUuid}?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: AdmissionLocation }, Error>(
    locationsUrl,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      data: data?.data?.bedLayouts ?? [],
      error,
      isLoading,
      isValidating,
      mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return results;
};

export const useBedTypes = () => {
  const url = `${restBaseUrl}/bedtype/`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<BedType> } }, Error>(
    url,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      bedTypes: data?.data?.results ?? [],
      errorLoadingBedTypes: error,
      isLoadingBedTypes: isLoading,
      isValidatingBedTypes: isValidating,
      mutateBedTypes: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return results;
};

export const useBedTags = () => {
  const url = `${restBaseUrl}/bedTag/`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<BedTagData> } }, Error>(
    url,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      bedTags: data?.data?.results ?? [],
      errorLoadingBedTags: error,
      isLoadingBedTags: isLoading,
      isValidatingBedTags: isValidating,
      mutateBedTags: mutate,
    }),
    [data, error, isLoading, isValidating, mutate],
  );

  return results;
};

export async function saveBedType({
  bedTypePayload,
}: {
  bedTypePayload: BedTypePayload;
}): Promise<FetchResponse<BedType>> {
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/bedtype`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTypePayload,
  });
  return response;
}

export async function saveBedTag({
  bedTagPayload,
}: {
  bedTagPayload: BedTagPayload;
}): Promise<FetchResponse<BedTagData>> {
  return await openmrsFetch(`${restBaseUrl}/bedTag/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTagPayload,
  });
}

export async function editBedType({
  bedTypePayload,
  bedTypeId,
}: {
  bedTypeId: string;
  bedTypePayload: BedTypePayload;
}): Promise<FetchResponse<BedType>> {
  return await openmrsFetch(`${restBaseUrl}/bedtype/${bedTypeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTypePayload,
  });
}

export async function editBedTag({
  bedTagPayload,
  bedTagId,
}: {
  bedTagId: string;
  bedTagPayload: BedTagPayload;
}): Promise<FetchResponse<BedTagData>> {
  return await openmrsFetch(`${restBaseUrl}/bedTag/${bedTagId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTagPayload,
  });
}
