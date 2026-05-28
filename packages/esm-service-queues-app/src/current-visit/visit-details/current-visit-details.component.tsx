import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListBody, StructuredListCell, StructuredListRow, StructuredListWrapper } from '@carbon/react';
import {
  ExtensionSlot,
  formatTime,
  launchWorkspace2,
  parseDate,
  usePatient,
  type OpenmrsResource,
  type Visit,
} from '@openmrs/esm-framework';
import { type Note, type Encounter, type Observation, type DiagnosisItem } from '../../types/index';
import TriageNote from './triage-note.component';
import styles from '../current-visit.scss';

interface CurrentVisitProps {
  patientUuid: string;
  encounters: Array<Encounter | OpenmrsResource>;
  visit?: Visit;
}

const CurrentVisitDetails: React.FC<CurrentVisitProps> = ({ patientUuid, encounters, visit }) => {
  const { t } = useTranslation();
  const { patient } = usePatient(patientUuid);

  const launchCustomVitalsForm = useCallback(() => {
    launchWorkspace2('service-queues-vitals-form-workspace', {
      patientUuid,
      patient,
      visitContext: visit,
    });
  }, [patient, patientUuid, visit]);

  const [diagnoses, notes]: [Array<DiagnosisItem>, Array<Note>] = useMemo(() => {
    const notes: Array<Note> = [];
    const diagnoses: Array<DiagnosisItem> = [];

    encounters?.forEach((enc: Encounter) => {
      if (enc.encounterType?.display === 'Visit Note') {
        enc.obs.forEach((obs: Observation) => {
          if (obs.concept && obs.concept.display === 'Visit Diagnoses') {
            diagnoses.push({
              diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST').value.display,
            });
          } else if (obs.concept && obs.concept.display === 'General patient note') {
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
    });
    return [diagnoses, notes];
  }, [encounters]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.visitContainer}>
        <StructuredListWrapper className={styles.structuredList}>
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
                <ExtensionSlot
                  name="service-queues-patient-vitals-slot"
                  state={{ patient, patientUuid, visitContext: visit, launchCustomVitalsForm }}
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
