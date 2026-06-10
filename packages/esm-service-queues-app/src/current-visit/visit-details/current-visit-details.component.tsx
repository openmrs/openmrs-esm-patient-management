import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListBody, StructuredListCell, StructuredListRow, StructuredListWrapper } from '@carbon/react';
import { type OpenmrsResource, type Visit, formatTime, parseDate, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { type Note, type Encounter, type Observation, type DiagnosisItem } from '../../types/index';
import { useVitalsFromObs } from '../hooks/useVitalsConceptMetadata';
import VisitNote from './visit-note.component';
import Vitals from './vitals.component';
import styles from '../current-visit.scss';

interface CurrentVisitProps {
  patientUuid: string;
  encounters: Array<Encounter | OpenmrsResource>;
  visit?: Visit;
}

enum visitTypes {
  CURRENT = 'currentVisit',
  PAST = 'pastVisit',
}

const CurrentVisitDetails: React.FC<CurrentVisitProps> = ({ patientUuid, encounters, visit }) => {
  const { t } = useTranslation();
  const { concepts, visitNoteEncounterTypeUuid } = useConfig<ConfigObject>();

  const [diagnoses, notes, vitalsToRetrieve]: [Array<DiagnosisItem>, Array<Note>, Array<Encounter>] = useMemo(() => {
    const notes: Array<Note> = [];
    const vitalsToRetrieve: Array<Encounter> = [];
    const diagnoses: Array<DiagnosisItem> = [];

    // Iterating through every Encounter
    encounters?.forEach((enc: Encounter) => {
      // Gate on encounter type so notes/diagnoses concepts reused elsewhere don't leak in here.
      if (enc.encounterType?.uuid === visitNoteEncounterTypeUuid) {
        enc.obs?.forEach((obs: Observation) => {
          if (obs.concept?.uuid === concepts.visitDiagnosesConceptUuid) {
            const problemList = obs.groupMembers?.find((mem) => mem.concept?.uuid === concepts.problemListConceptUuid);
            if (problemList?.value?.display) {
              diagnoses.push({ diagnosis: problemList.value.display });
            }
          } else if (obs.concept?.uuid === concepts.generalPatientNoteConceptUuid) {
            notes.push({
              note: obs.value,
              provider: {
                name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
                role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
              },
              time: formatTime(parseDate(obs.obsDatetime)),
              concept: obs.concept,
            });
          }
        });
      }

      vitalsToRetrieve.push(enc);
    });
    return [diagnoses, notes, vitalsToRetrieve];
  }, [
    encounters,
    visitNoteEncounterTypeUuid,
    concepts.generalPatientNoteConceptUuid,
    concepts.problemListConceptUuid,
    concepts.visitDiagnosesConceptUuid,
  ]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.visitContainer}>
        <StructuredListWrapper className={styles.structuredList}>
          <StructuredListBody>
            <StructuredListRow className={styles.structuredListRow}>
              <StructuredListCell>{t('visitNote', 'Visit note')}</StructuredListCell>
              <StructuredListCell>
                <VisitNote notes={notes} diagnoses={diagnoses} patientUuid={patientUuid} />
              </StructuredListCell>
            </StructuredListRow>
            <StructuredListRow className={styles.structuredListRow}>
              <StructuredListCell>{t('vitals', 'Vitals')}</StructuredListCell>
              <StructuredListCell>
                {' '}
                <Vitals
                  vitals={useVitalsFromObs(vitalsToRetrieve)}
                  patientUuid={patientUuid}
                  visitType={visitTypes.CURRENT}
                  visit={visit}
                />
              </StructuredListCell>
            </StructuredListRow>
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    </div>
  );
};

export default CurrentVisitDetails;
