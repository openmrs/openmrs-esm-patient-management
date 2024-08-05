import { openmrsFetch, restBaseUrl, type Concept } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type TagConfigObject } from '../../config-schema-extension-colored-obs-tags';

// prettier-ignore
export const obsCustomRepresentation = 
  'custom:(uuid,display,obsDatetime,value,' + 
    'concept:(uuid,display),' + 
    'encounter:(uuid,display,' + 
      'visit:(uuid,display)))';

//  get the setMembers of a concept set
const conceptSetCustomRepresentation = 'custom:(uuid,setMembers:(uuid))';

export function useConceptToTagColorMap(tags: Array<TagConfigObject>) {
  // fetch the members of the concept sets and process the data
  // to return conceptToTagColorMap (wrapped in a promise).
  // Let swr cache the result of this function.
  const fetchAndMap = (url: string) => {
    const conceptSetToTagColorMap = new Map<string, string>();
    for (const tag of tags) {
      const { color, appliedToConceptSets } = tag;
      for (const answer of appliedToConceptSets ?? []) {
        if (!conceptSetToTagColorMap.has(answer)) {
          conceptSetToTagColorMap.set(answer, color);
        }
      }
    }

    return openmrsFetch<{ results: Array<Concept> }>(url).then((data) => {
      const conceptSets = data.data.results;
      const conceptToTagColorMap = new Map<string, string>();
      if (conceptSets) {
        for (const conceptSet of conceptSets) {
          for (const concept of conceptSet.setMembers) {
            if (!conceptToTagColorMap.has(concept.uuid)) {
              conceptToTagColorMap.set(concept.uuid, conceptSetToTagColorMap.get(conceptSet.uuid));
            }
          }
        }
      }

      return conceptToTagColorMap;
    });
  };

  const conceptSetUuids = tags.flatMap((tag) => tag.appliedToConceptSets);
  const apiUrl = `${restBaseUrl}/concept?references=${conceptSetUuids.join()}&v=${conceptSetCustomRepresentation}`;
  const conceptToTagColorMap = useSWRImmutable(apiUrl, fetchAndMap);

  return conceptToTagColorMap;
}
