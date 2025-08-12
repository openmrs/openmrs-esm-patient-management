import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type BedPostPayload, type BedTag, type BedTagMap } from '../../types';

interface BedForm {
  bedNumber: string;
  bedType: string;
  row: number;
  column: number;
  status: string;
  locationUuid: string;
  uuid?: string;
}

export async function saveBed({ bedPayload }: { bedPayload: BedPostPayload }): Promise<FetchResponse<BedForm>> {
  const response = await openmrsFetch(`${restBaseUrl}/bed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      bedNumber: bedPayload.bedNumber,
      bedType: bedPayload.bedType,
      row: bedPayload.row,
      column: bedPayload.column,
      status: bedPayload.status,
      locationUuid: bedPayload.locationUuid,
    },
  });

  if (bedPayload.bedTag && bedPayload.bedTag.length > 0) {
    const bedUuid = response.data.uuid;
    await createBedTagMappings(bedUuid, bedPayload.bedTag);
  }

  return response;
}

export async function editBed({
  bedPayload,
  bedUuid,
}: {
  bedPayload: BedPostPayload;
  bedUuid: string;
}): Promise<FetchResponse<BedForm>> {
  const response = await openmrsFetch(`${restBaseUrl}/bed/${bedUuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      uuid: bedPayload.uuid,
      bedNumber: bedPayload.bedNumber,
      bedType: bedPayload.bedType,
      row: bedPayload.row,
      column: bedPayload.column,
      status: bedPayload.status,
      locationUuid: bedPayload.locationUuid,
    },
  });

  await updateBedTagMappings(bedUuid, bedPayload.bedTag || []);

  return response;
}

async function createBedTagMappings(bedUuid: string, bedTags: BedTag[]): Promise<void> {
  const mappingPromises = bedTags
    .filter((tag) => Boolean(tag.uuid))
    .map((tag) =>
      openmrsFetch(`${restBaseUrl}/bedTagMap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          bed: bedUuid,
          bedTag: tag.uuid,
        },
      }),
    );
  await Promise.all(mappingPromises);
}

async function updateBedTagMappings(bedUuid: string, bedTags: BedTag[]): Promise<void> {
  try {
    const existingMappingsResponse = await openmrsFetch(`${restBaseUrl}/admissionLocation?v=full`);
    const allBeds = existingMappingsResponse.data?.results?.flatMap((location) => location.bedLayouts || []) || [];
    const targetBed = allBeds.find((bed) => bed.bedUuid === bedUuid);
    const existingMappings = targetBed?.bedTagMaps || [];

    if (existingMappings.length > 0) {
      const deletePromises = existingMappings.map((mapping) =>
        openmrsFetch(`${restBaseUrl}/bedTagMap/${mapping.uuid}`, {
          method: 'DELETE',
        }),
      );
      await Promise.all(deletePromises);
    }

    if (bedTags.length > 0) {
      await createBedTagMappings(bedUuid, bedTags);
    }
  } catch (error) {
    if (error?.message?.includes?.('Tag Already Present')) {
      throw error;
    }
    if (bedTags.length > 0) {
      await createBedTagMappings(bedUuid, bedTags);
    }
  }
}

export async function getBedTagMappings(bedUuid: string): Promise<BedTag[]> {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/admissionLocation?v=full`);
    const locations = response.data?.results || [];

    for (const location of locations) {
      if (location.bedLayouts) {
        for (const bedLayout of location.bedLayouts) {
          if (bedLayout.bedUuid === bedUuid) {
            return (
              bedLayout.bedTagMaps?.map((tagMap: BedTagMap) => ({
                uuid: tagMap.bedTag?.uuid,
                id: tagMap.bedTag?.uuid,
                name: tagMap.bedTag?.name,
              })) || []
            );
          }
        }
      }
    }

    return [];
  } catch (error) {
    throw new Error(`Failed to fetch bed tag mappings for bed UUID ${bedUuid}: ${error.message}`);
  }
}

export function useBedTagMappings(bedUuid?: string) {
  const shouldFetch = !!bedUuid;

  const { data, error, isLoading } = useSWR<BedTag[]>(
    shouldFetch ? `bedTagMappings-${bedUuid}` : null,
    () => getBedTagMappings(bedUuid!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    bedTagMappings: data || [],
    isLoading: shouldFetch ? isLoading : false,
    error: shouldFetch ? error : null,
  };
}

export function useBedType() {
  const locationsUrl = `${restBaseUrl}/bedtype`;
  const { data, error, isLoading } = useSWR<{ data }>(locationsUrl, openmrsFetch);

  const bedTypes = useMemo(() => {
    const rawData = data?.data?.results ?? [];
    const uniqueBedTypes = [];

    rawData.forEach((response) => {
      if (!uniqueBedTypes.some((bedType) => bedType.name === response.name)) {
        uniqueBedTypes.push(response);
      }
    });

    return uniqueBedTypes;
  }, [data?.data?.results]);

  return { bedTypes: bedTypes ?? [], isLoading, error };
}
