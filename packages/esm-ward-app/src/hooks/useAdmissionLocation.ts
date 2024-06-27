import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AdmissionLocation } from '../types/index';
import useSWRImmutable from 'swr/immutable';

export function useAdmissionLocation(locationUuid: string, rep: string = 'full') {
  const apiUrl = locationUuid ? `${restBaseUrl}/admissionLocation/${locationUuid}?v=${rep}` : null;
  const { data, ...rest } = useSWRImmutable<{ data: AdmissionLocation }, Error>(apiUrl, openmrsFetch);
  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
