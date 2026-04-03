import useSWR from 'swr';
import { type Visit, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

/**
 * Custom hook to fetch active visits from the OpenMRS REST API.
 * @returns An object containing the visits, isLoading flag, and error message.
 */
export const useActiveVisits = () => {
  const visitsUrl = `${restBaseUrl}/visit?includeInactive=false&v=custom:(uuid,patient:(uuid),startDatetime,stopDatetime)`;
  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Visit[] } }>(visitsUrl, openmrsFetch);
  const visits = data?.data?.results ?? [];

  return { isLoading, visits, error, mutateVisits: mutate };
};
