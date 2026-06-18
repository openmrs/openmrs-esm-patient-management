import React from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListBody, StructuredListCell, StructuredListRow, StructuredListWrapper } from '@carbon/react';
import { type OpenmrsResource, type Visit } from '@openmrs/esm-framework';
import { type Encounter } from '../../types/index';
import { useNotesAndDiagnoses } from '../hooks/useNotesAndDiagnoses';
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
  const { notes, diagnoses } = useNotesAndDiagnoses(encounters as Array<Encounter>);

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
                  vitals={useVitalsFromObs(encounters)}
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
