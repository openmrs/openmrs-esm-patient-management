import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type Concept, type Queue } from '../types';

export function useConcept(uuid: string) {
  const apiUrl = `${restBaseUrl}/concept/${uuid}`;
  const { data, ...rest } = useSWRImmutable<{ data: { results: Array<Concept> } }, Error>(apiUrl, openmrsFetch);
  return {
    data: data?.data?.results && data.data.results.length > 0 ? data.data.results[0] : null,
    ...rest,
  };
}
