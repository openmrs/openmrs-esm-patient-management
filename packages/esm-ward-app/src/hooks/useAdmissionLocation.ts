import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type AdmissionLocation } from '../types/index';

export function useAdmissionLocation(locationUuid: string, rep: string = 'full') {
  const apiUrl = `${restBaseUrl}/admissionLocation/${locationUuid}` + (rep ? `?v=${rep}` : '');
  const { data, ...rest } = useSWR<{ data: AdmissionLocation }, Error>(apiUrl, openmrsFetch);

  return {
    admissionLocation: data?.data ?? null,
    ...rest,
  };
}
