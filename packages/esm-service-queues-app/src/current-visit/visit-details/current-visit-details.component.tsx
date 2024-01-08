import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import { type OpenmrsResource, formatTime, parseDate } from '@openmrs/esm-framework';
import { type Note, type Encounter, type Observation, type DiagnosisItem } from '../../types/index';
import { useVitalsFromObs } from '../hooks/useVitalsConceptMetadata';
import TriageNote from './triage-note.component';
import Vitals from './vitals.component';
import styles from '../current-visit.scss';

interface CurrentVisitProps {
  patientUuid: string;
  encounters: Array<Encounter | OpenmrsResource>;
}

enum visitTypes {
  CURRENT = 'currentVisit',
  PAST = 'pastVisit',
}

const CurrentVisitDetails: React.FC<CurrentVisitProps> = ({ patientUuid, encounters }) => {
  const { t } = useTranslation();

  const [diagnoses, notes, vitalsToRetrieve]: [Array<DiagnosisItem>, Array<Note>, Array<Encounter>] = useMemo(() => {
    const notes: Array<Note> = [];
    const vitalsToRetrieve: Array<Encounter> = [];
    const diagnoses: Array<DiagnosisItem> = [];

    // Iterating through every Encounter
    encounters?.forEach((enc: Encounter) => {
      // Check for Visit Diagnoses and Notes
      if (enc.encounterType?.display === 'Visit Note') {
        enc.obs.forEach((obs: Observation) => {
          if (obs.concept && obs.concept.display === 'Visit Diagnoses') {
            // // Putting all the diagnoses in a single array.
            diagnoses.push({
              diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST').value.display,
            });
          } else if (obs.concept && obs.concept.display === 'General patient note') {
            // Putting all notes in a single array.
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
  }, [encounters]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.visitContainer}>
        <StructuredListWrapper className={styles.structuredList}>
          <StructuredListHead></StructuredListHead>
          <StructuredListBody>
            <StructuredListRow className={styles.structuredListRow}>
              <StructuredListCell>{t('triageNote', 'Triage note')}</StructuredListCell>
              <StructuredListCell>
                <TriageNote notes={notes} diagnoses={diagnoses} patientUuid={patientUuid} />
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
