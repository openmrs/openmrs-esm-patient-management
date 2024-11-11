import { restBaseUrl, useOpenmrsFetchAll, type Concept } from '@openmrs/esm-framework';
import { type Observation } from '../../types';
import { type TFunction } from 'i18next';
import { type ColoredObsTagConfig } from '../../config-schema';

// prettier-ignore
export const obsCustomRepresentation = 
  'custom:(uuid,display,obsDatetime,value,' + 
    'concept:(uuid,display),' + 
    'encounter:(uuid,display,encounterType,encounterDatetime,' + 
      'visit:(uuid,display)))';

//  get the setMembers of a concept set
const conceptSetCustomRepresentation = 'custom:(uuid,setMembers:(uuid))';

export function useConceptToTagColorMap(tags: Array<ColoredObsTagConfig> = []) {
  // The TacConfigObject allows us to specify the mapping of
  // concept sets to colors. However, we also need to build a map of
  // concepts to colors. This function does that.

  // TODO: We should cache this map to be re-usable app-wide
  const conceptSetToTagColorMap = new Map<string, string>();
  for (const tag of tags) {
    const { color, appliedToConceptSets } = tag;
    for (const answer of appliedToConceptSets ?? []) {
      if (!conceptSetToTagColorMap.has(answer)) {
        conceptSetToTagColorMap.set(answer, color);
      }
    }
  }

  const conceptSetUuids = tags.flatMap((tag) => tag.appliedToConceptSets);
  const apiUrl = `${restBaseUrl}/concept?references=${conceptSetUuids.join()}&v=${conceptSetCustomRepresentation}`;
  const { data: conceptSets } = useOpenmrsFetchAll<Concept>(apiUrl);

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
}

export function getObsEncounterString(obs: Observation, t: TFunction) {
  return t('encounterDisplay', '{{encounterType}} {{encounterDate}}', {
    encounterType: obs.encounter.encounterType.display,
    encounterDate: new Date(obs.encounter.encounterDatetime).toLocaleDateString(),
    interpolation: { escapeValue: false },
  });
}
