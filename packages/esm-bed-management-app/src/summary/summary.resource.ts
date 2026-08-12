import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  const { data, isLoading, error, mutate, isValidating } = useSWR<{ data: { results: Array<Bed> } }, Error>(
    locationUuid ? apiUrl : null,
    openmrsFetch,
  );

  const mappedBedData: MappedBedData = (data?.data?.results ?? []).map((bed) => ({
    id: bed.id,
    type: bed.bedType?.displayName,
    number: bed.bedNumber,
    status: bed.status,
    uuid: bed.uuid,
  }));

  const results = useMemo(
    () => ({
      bedsData: mappedBedData,
      errorLoadingBeds: error,
      isLoadingBeds: isLoading,
      mutate,
      isValidating,
    }),
    [mappedBedData, isLoading, error, mutate, isValidating],
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
  // SWR-backed aggregation of beds across admission locations.
  // Use AbortController per-fetch and preserve previous data on background failures.
  const controllersRef = useRef(new Set<AbortController>());

  useEffect(() => {
    const activeControllers = controllersRef.current;

    return () => {
      // Abort any in-flight requests when unmounting or when locations change.
      activeControllers.forEach((c) => c.abort());
      activeControllers.clear();
    };
  }, [admissionLocations]);

  const locationUuids = (admissionLocations || []).map((l) => l.uuid).sort();
  const swrKey = locationUuids.length ? ['beds-aggregate', ...locationUuids] : null;

  const fetcher = async () => {
    const controller = new AbortController();
    controllersRef.current.add(controller);
    try {
      const promises = (admissionLocations || []).map(async (location) => {
        const bedsUrl = `${restBaseUrl}/bed?locationUuid=${location.uuid}`;
        const bedsFetchResult = await openmrsFetch<BedFetchResponse>(bedsUrl, {
          method: 'GET',
          signal: controller.signal,
        });
        if (bedsFetchResult?.data?.results?.length) {
          return bedsFetchResult.data.results.map((bed) => ({ ...bed, location }));
        }
        return null;
      });

      const updatedWards = (await Promise.all(promises)).filter(Boolean) as Array<Array<Bed & { location: any }>>;
      return updatedWards;
    } catch (err: unknown) {
      // SWR will surface the error; if aborted, rethrow to let caller ignore.
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      throw err;
    } finally {
      controllersRef.current.delete(controller);
    }
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(swrKey, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: true,
  });

  const results = useMemo(
    () => ({
      bedsGroupedByLocation: (data as Array<Array<Bed & { location: any }>> | undefined) ?? [],
      errorFetchingBedsGroupedByLocation: (error as Error) ?? null,
      isLoadingBedsGroupedByLocation: (isLoading || isLoadingAdmissionLocations) ?? false,
      isValidatingBedsGroupedByLocation: isValidating ?? false,
      mutateBedsGroupedByLocation: mutate,
    }),
    [data, error, isLoading, isLoadingAdmissionLocations, isValidating, mutate],
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

export async function deleteBedTag({ bedTagId, reason }: { bedTagId: string; reason: string }): Promise<FetchResponse> {
  return await openmrsFetch(`${restBaseUrl}/bedTag/${bedTagId}?reason=${encodeURIComponent(reason)}`, {
    method: 'DELETE',
  });
}

export async function deleteBedType({
  bedTypeId,
  reason,
}: {
  bedTypeId: string;
  reason: string;
}): Promise<FetchResponse> {
  return await openmrsFetch(`${restBaseUrl}/bedtype/${bedTypeId}?reason=${encodeURIComponent(reason)}`, {
    method: 'DELETE',
  });
}
