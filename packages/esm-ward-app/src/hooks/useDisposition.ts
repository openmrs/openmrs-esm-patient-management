import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import type { Disposition } from '../types';

export function useDisposition(locationUuid: string) {
  const apiUrl = `${restBaseUrl}/emrapi/disposition?type=ADMISSION&dispositionLocation=${locationUuid}`;
  const { data, ...rest } = useSWR<{ data: Array<Disposition> }, Error>(apiUrl, openmrsFetch);

  return {
    dispositionData: data?.data || null,
    ...rest,
  };
}
