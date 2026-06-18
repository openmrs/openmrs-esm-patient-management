import { formatTime, parseDate, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type Note, type DiagnosisItem, type Encounter, type Observation } from '../../types';

export const useNotesAndDiagnoses = (encounters: Array<Encounter>) => {
  const { concepts, visitNoteEncounterTypeUuid } = useConfig<ConfigObject>();
  const notes: Array<Note> = [];
  const diagnoses: Array<DiagnosisItem> = [];

  encounters?.forEach((encounter) => {
    // Gate on encounter type so notes/diagnoses concepts reused elsewhere don't leak in here.
    if (encounter?.encounterType?.uuid !== visitNoteEncounterTypeUuid) {
      return;
    }

    encounter.obs?.forEach((obs: Observation) => {
      if (obs?.concept?.uuid === concepts.visitDiagnosesConceptUuid) {
        const problemList = obs.groupMembers?.find((mem) => mem.concept?.uuid === concepts.problemListConceptUuid);
        if (problemList?.value?.display) {
          diagnoses.push({ diagnosis: problemList.value.display });
        }
      } else if (obs?.concept?.uuid === concepts.generalPatientNoteConceptUuid) {
        notes.push({
          note: String(obs.value ?? ''),
          provider: {
            name: encounter.encounterProviders?.[0]?.provider?.person?.display ?? '',
            role: encounter.encounterProviders?.[0]?.encounterRole?.display ?? '',
          },
          time: encounter.encounterDatetime ? formatTime(parseDate(encounter.encounterDatetime)) : '',
          concept: obs.concept,
        });
      }
    });
  });

  return { notes, diagnoses };
};
