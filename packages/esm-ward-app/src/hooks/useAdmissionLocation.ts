import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AdmissionLocation } from '../types/index';
import useSWRImmutable from 'swr/immutable';
import useWardLocation from './useWardLocation';

const requestRep =
  'custom:(ward,totalBeds,occupiedBeds,bedLayouts:(rowNumber,columnNumber,bedNumber,bedId,bedUuid,status,location,patients:(person:full,identifiers,uuid)))';

export function useAdmissionLocation(rep: string = requestRep) {
  const { location } = useWardLocation();
  const apiUrl = location?.uuid ? `${restBaseUrl}/admissionLocation/${location?.uuid}?v=${rep}` : null;
  const { data, ...rest } = useSWRImmutable<{ data: AdmissionLocation }, Error>(apiUrl, openmrsFetch);
  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
