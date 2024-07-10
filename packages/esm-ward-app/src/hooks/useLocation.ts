import { type Location, openmrsFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export default function useLocation(locationUuid: string, rep: string = 'custom:(display,uuid)') {
  return useSWRImmutable<FetchResponse<Location>>(
    locationUuid ? `${restBaseUrl}/location/${locationUuid}?v=${rep}` : null,
    openmrsFetch,
  );
}
