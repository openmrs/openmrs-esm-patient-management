import { useEffect } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, useSession } from '@openmrs/esm-framework';

const refreshActiveVisitsEventName = 'openmrs:active-visits-refresh';

export default function useActiveVisits() {
  const session = useSession();
  const sessionLocation = session?.sessionLocation?.uuid;

  const customRepresentation = 'custom:(uuid,startDatetime,stopDatetime)';

  const getUrl = () => {
    let url = `${restBaseUrl}/visit?v=${customRepresentation}&`;
    let urlSearchParams = new URLSearchParams();

    urlSearchParams.append('includeParentLocations', 'true');
    urlSearchParams.append('includeInactive', 'false');
    urlSearchParams.append('totalCount', 'true');
    urlSearchParams.append('location', `${sessionLocation}`);

    return url + urlSearchParams.toString();
  };

  const { data, error, isLoading, mutate } = useSWR<{ data: { totalCount: number } }>(getUrl, openmrsFetch);

  useEffect(() => {
    const handleRefresh = () => {
      mutate();
    };

    window.addEventListener(refreshActiveVisitsEventName, handleRefresh);
    return () => window.removeEventListener(refreshActiveVisitsEventName, handleRefresh);
  }, [mutate]);

  return {
    count: data?.data?.totalCount,
    error,
    isLoading,
  };
}
