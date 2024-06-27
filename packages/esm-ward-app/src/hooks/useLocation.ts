import { type Location, openmrsFetch, restBaseUrl, useOpenmrsSWR } from '@openmrs/esm-framework';

export default function useLocation(locationUuid: string, rep: string = 'custom:(display,uuid)') {
  return useOpenmrsSWR<Location>(locationUuid ? `${restBaseUrl}/location/${locationUuid}?v=${rep}` : null, {
    swrConfig: {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  });
}
