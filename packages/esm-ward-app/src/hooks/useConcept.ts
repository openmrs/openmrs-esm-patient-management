import { type Concept, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';

export function useConcepts(uuids: string[], rep = 'default') {
  const apiUrl = `${restBaseUrl}/concept?references=${uuids.join()}&v=${rep}`;
  const { data, ...rest } = useSWRImmutable<{ data: { results: Array<Concept> } }, Error>(apiUrl, openmrsFetch);
  return {
    concepts: data?.data?.results,
    ...rest,
  };
}
