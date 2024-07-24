import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import type {
  AdmissionLocation,
  Bed,
  BedFetchResponse,
  BedTagPayload,
  BedTypePayload,
  LocationFetchResponse,
  MappedBedData,
  Mutator,
} from '../types';
import { type BedManagementConfig } from '../config-schema';
import { useCallback, useEffect, useState } from 'react';

export const useLocationsWithAdmissionTag = () => {
  const { admissionLocationTagName } = useConfig<BedManagementConfig>();
  const locationsUrl = `/ws/rest/v1/location?tag=${admissionLocationTagName}&v=full`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<LocationFetchResponse, Error>(
    admissionLocationTagName ? locationsUrl : null,
    openmrsFetch,
  );

  return {
    data: data?.data?.results ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useBedsForLocation = (locationUuid: string) => {
  const apiUrl = `/ws/rest/v1/bed?locationUuid=${locationUuid}&v=full`;

  const { data, isLoading, error } = useSWR<{ data: { results: Array<Bed> } }, Error>(
    locationUuid ? apiUrl : null,
    openmrsFetch,
  );

  const mappedBedData: MappedBedData = (data?.data?.results ?? []).map((bed) => ({
    id: bed.id,
    number: bed.bedNumber,
    name: bed.bedType?.displayName,
    description: bed.bedType?.description,
    status: bed.status,
    uuid: bed.uuid,
  }));

  return {
    bedData: mappedBedData,
    isLoading,
    error,
  };
};

export const useLocationName = (locationUuid: string) => {
  const { data: allLocations, isLoading } = useLocationsWithAdmissionTag();

  const location = allLocations.find((loc) => loc.uuid == locationUuid);
  return {
    name: location?.display ?? null,
    isLoadingLocationData: isLoading,
  };
};

export function useBedsGroupedByLocation() {
  const { data: locations, isLoading: isLoadingLocations } = useLocationsWithAdmissionTag();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState([]);

  useEffect(() => {
    if (!isLoadingLocations && locations && isValidating) {
      const fetchData = async () => {
        const promises = locations.map(async (location) => {
          const bedsUrl = `/ws/rest/v1/bed?locationUuid=${location.uuid}`;
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
        setResult(updatedWards);
      };
      fetchData()
        .catch((e) => {
          setError(e);
        })
        .finally(() => {
          setIsLoading(false);
          setIsValidating(false);
        });
    }
  }, [locations, isLoading]);

  const mutate = useCallback(() => {
    setIsValidating(true);
  }, []);

  return {
    data: result,
    error,
    isLoading: isLoading || isLoadingLocations,
    isValidating,
    mutate,
  };
}

export const useAdmissionLocations = () => {
  const locationsUrl = `/ws/rest/v1/admissionLocation?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    { data: { results: Array<AdmissionLocation> } },
    Error
  >(locationsUrl, openmrsFetch);

  return {
    data: data?.data?.results ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useAdmissionLocationBedLayout = (locationUuid: string) => {
  const locationsUrl = `/ws/rest/v1/admissionLocation/${locationUuid}?v=full`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: AdmissionLocation }, Error>(
    locationsUrl,
    openmrsFetch,
  );

  return {
    data: data?.data?.bedLayouts ?? [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

export const useBedType = () => {
  const url = `/ws/rest/v1/bedtype/`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(url, openmrsFetch);
  const results = data?.data?.results ? data?.data?.results : [];
  return {
    bedTypeData: results,
    isError: error,
    loading: isLoading,
    validate: isValidating,
    mutate,
  };
};

export const useBedTag = () => {
  const url = `/ws/rest/v1/bedTag/`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data }, Error>(url, openmrsFetch);
  const results = data?.data?.results ? data?.data?.results : [];
  return {
    bedTypeData: results,
    isError: error,
    loading: isLoading,
    validate: isValidating,
    mutate,
  };
};
interface BedType {
  name: string;
  displayName: string;
  description: string;
}
interface BedTag {
  name: string;
}
export async function saveBedType({
  bedTypePayload,
}: {
  bedTypePayload: BedTypePayload;
}): Promise<FetchResponse<BedType>> {
  const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedtype`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTypePayload,
  });
  return response;
}

export async function saveBedTag({ bedTagPayload }: { bedTagPayload: BedTagPayload }): Promise<FetchResponse<BedTag>> {
  const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedTag/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTagPayload,
  });
  return response;
}
export async function editBedType({
  bedTypePayload,
  bedTypeId,
}: {
  bedTypePayload: BedTypePayload;
  bedTypeId: string;
}): Promise<FetchResponse<BedType>> {
  const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedtype/${bedTypeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTypePayload,
  });
  return response;
}
export async function editBedTag({
  bedTagPayload,
  bedTagId,
}: {
  bedTagPayload: BedTagPayload;
  bedTagId: string;
}): Promise<FetchResponse<BedType>> {
  const response: FetchResponse = await openmrsFetch(`/ws/rest/v1/bedTag/${bedTagId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedTagPayload,
  });
  return response;
}
