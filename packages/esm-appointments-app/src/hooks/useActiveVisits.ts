import useSWR from 'swr';
import { useSession, type Visit, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

/**
 * Custom hook to fetch active visits from the OpenMRS REST API.
 * @returns An object containing the visits, isLoading flag, and error message.
 */
export const useActiveVisits = () => {
  const session = useSession();
  const visitsUrl = `${restBaseUrl}/visit?includeInactive=false&includeParentLocations=true&v=custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,stopDatetime)&location=${session?.sessionLocation?.uuid}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Visit[] } }>(visitsUrl, openmrsFetch);
  const visits = data?.data?.results ?? [];

  return { isLoading, visits, error, mutateVisits: mutate };
};
