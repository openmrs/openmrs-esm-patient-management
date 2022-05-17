import React, { useMemo } from 'react';
import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { OpenmrsResource, useConfig, formatTime, parseDate } from '@openmrs/esm-framework';
import styles from '../current-visit.scss';
import TriageNote from './triage-note.component';
import Vitals from './vitals.component';
import { Note, Encounter, Observation, PatientVitals, DiagnosisItem } from '../current-visit.resource';

interface CurrentVisitProps {
  patientUuid: string;
  encounters: Array<Encounter | OpenmrsResource>;
}

const CurrentVisitDetails: React.FC<CurrentVisitProps> = ({ patientUuid, encounters }) => {
  const { t } = useTranslation();
  const [diagnoses, notes, vitals]: [Array<DiagnosisItem>, Array<Note>, Array<PatientVitals>] = useMemo(() => {
    const notes: Array<Note> = [];
    const vitals: Array<PatientVitals> = [];
    const diagnoses: Array<DiagnosisItem> = [];

    // Iterating through every Encounter
    encounters.forEach((enc: Encounter) => {
      // Check for Visit Diagnoses and Notes
      if (enc.encounterType.display === 'Visit Note') {
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

      enc.obs.forEach((obs: Observation) => {
        if (obs.concept && obs.concept.display === 'Pulse') {
          vitals.push({
            pulse: obs.value,
            provider: {
              name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
              role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
            },
            time: formatTime(parseDate(obs.obsDatetime)),
          });
        } else if (obs.concept && obs.concept.display === 'Arterial blood oxygen saturation (pulse oximeter)') {
          vitals.push({
            oxygenSaturation: obs.value,
          });
        } else if (obs.concept && obs.concept.display === 'Respiratory rate') {
          vitals.push({
            respiratoryRate: obs.value,
          });
        } else if (obs.concept && obs.concept.display === 'Temperature (C)') {
          vitals.push({
            temperature: obs.value,
          });
        } else if (obs.concept && obs.concept.display === 'Systolic') {
          vitals.push({
            systolic: obs.value,
          });
        } else if (obs.concept && obs.concept.display === 'Diastolic') {
          vitals.push({
            diastolic: obs.value,
          });
        } else if (obs.concept && obs.concept.display === 'Weight') {
          vitals.push({
            weight: obs.value,
          });
        } else if (obs.concept && obs.concept.display === 'Height') {
          vitals.push({
            height: obs.value,
          });
        }
      });
    });
    return [diagnoses, notes, vitals];
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
                <Vitals vitals={vitals} patientUuid={patientUuid} />
              </StructuredListCell>
            </StructuredListRow>
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    </div>
  );
};

export default CurrentVisitDetails;
