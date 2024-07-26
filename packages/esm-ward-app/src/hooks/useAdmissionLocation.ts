import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AdmissionLocation } from '../types/index';
import useSWRImmutable from 'swr/immutable';

const requestRep =
  'custom:(ward,totalBeds,occupiedBeds,bedLayouts:(rowNumber,columnNumber,bedNumber,bedId,bedUuid,status,location,patients:(person:full,identifiers,uuid)))';

export function useAdmissionLocation(locationUuid: string, rep: string = requestRep) {
  const apiUrl = locationUuid ? `${restBaseUrl}/admissionLocation/${locationUuid}?v=${rep}` : null;
  const { data, ...rest } = useSWRImmutable<{ data: AdmissionLocation }, Error>(apiUrl, openmrsFetch);
  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
