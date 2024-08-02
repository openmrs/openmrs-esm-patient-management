import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AdmissionLocationFetchResponse } from '../types/index';
import useSWRImmutable from 'swr/immutable';
import useWardLocation from './useWardLocation';

const requestRep =
  'custom:(ward,totalBeds,occupiedBeds,bedLayouts:(rowNumber,columnNumber,bedNumber,bedId,bedUuid,status,location,patients:(person:full,identifiers,uuid)))';

// note "admissionLocation" sn't the clearest name, but it matches the endpoint; endpoint fetches bed information (including info about patients in those beds) for a location (as provided by the bed management module)
export function useAdmissionLocation(rep: string = requestRep) {
  const { location } = useWardLocation();
  const apiUrl = location?.uuid ? `${restBaseUrl}/admissionLocation/${location?.uuid}?v=${rep}` : null;
  const { data, ...rest } = useSWRImmutable<FetchResponse<AdmissionLocationFetchResponse>, Error>(apiUrl, openmrsFetch);
  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
