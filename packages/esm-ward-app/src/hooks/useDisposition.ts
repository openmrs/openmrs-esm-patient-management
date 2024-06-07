import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { Disposition } from '../types';

export function useDisposition(location: string) {
  const apiUrl = `${restBaseUrl}/emrapi/disposition?type=ADMISSION&dispositionLocation=ANCWard`;
  const { data, ...rest } = useSWR<{ data: Disposition }, Error>(apiUrl, openmrsFetch);

  return {
    dispositionData: data?.data || null,
    ...rest,
  };
}
