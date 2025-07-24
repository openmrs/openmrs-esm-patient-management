import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type BedPostPayload, type BedTag } from '../../types';

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

  if (response.status === 201 && bedPayload.bedTag && bedPayload.bedTag.length > 0) {
    const bedUuid = response.data.uuid;
    await createBedTagMappings(bedUuid, bedPayload.bedTag);
  }

  return response;
}

export async function editBed({
  bedPayload,
  bedId,
}: {
  bedPayload: BedPostPayload;
  bedId: string;
}): Promise<FetchResponse<BedForm>> {
  const response = await openmrsFetch(`${restBaseUrl}/bed/${bedId}`, {
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

  if (response.status === 200 || response.status === 201) {
    await updateBedTagMappings(bedId, bedPayload.bedTag || []);
  }

  return response;
}

async function createBedTagMappings(bedUuid: string, bedTags: BedTag[]): Promise<void> {
  const mappingPromises = bedTags.map((tag) =>
    openmrsFetch(`${restBaseUrl}/bedTagMap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        bed: bedUuid,
        bedTag: tag.uuid || tag.id,
      },
    }),
  );
  await Promise.all(mappingPromises);
}

async function updateBedTagMappings(bedUuid: string, bedTags: BedTag[]): Promise<void> {
  await createBedTagMappings(bedUuid, bedTags);
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
