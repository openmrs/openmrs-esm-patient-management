import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type AdmissionLocationFetchResponse } from '../types/index';
import useSWRImmutable from 'swr/immutable';

// note "admissionLocation" sn't the clearest name, but it matches the endpoint; endpoint fetches bed information (including info about patients in those beds) for a location (as provided by the bed management module)
export function useAdmissionLocation(locationUuid: string, rep: string = 'full') {
  const apiUrl = locationUuid ? `${restBaseUrl}/admissionLocation/${locationUuid}?v=${rep}` : null;
  const { data, ...rest } = useSWRImmutable<{ data: AdmissionLocationFetchResponse }, Error>(apiUrl, openmrsFetch);
  return {
    admissionLocation: data?.data,
    ...rest,
  };
}
