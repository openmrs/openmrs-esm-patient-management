import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type BedPostPayload } from '../types';

interface BedForm {
  bedNumber: string;
  bedType: string;
  row: number;
  column: number;
  status: string;
  locationUuid: string;
}

export async function saveBed({ bedPayload }: { bedPayload: BedPostPayload }): Promise<FetchResponse<BedForm>> {
  return await openmrsFetch(`${restBaseUrl}/bed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedPayload,
  });
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

export async function editBed({
  bedPayload,
  bedId,
}: {
  bedPayload: BedPostPayload;
  bedId: string;
}): Promise<FetchResponse<BedForm>> {
  return await openmrsFetch(`${restBaseUrl}/bed/${bedId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bedPayload,
  });
}
