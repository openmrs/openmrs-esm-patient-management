import { type Concept, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';

export function useConcepts(uuids: string[], rep = 'default') {
  const apiUrl = `${restBaseUrl}/concept?references=${uuids.join()}&v=${rep}`;
  const { data, ...rest } = useOpenmrsFetchAll<Concept>(apiUrl, { immutable: true });
  return {
    concepts: data,
    ...rest,
  };
}
