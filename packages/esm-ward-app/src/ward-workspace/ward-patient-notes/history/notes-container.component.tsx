import React from 'react';
import { useTranslation } from 'react-i18next';
import { type DefaultWorkspaceProps, type PatientUuid } from '@openmrs/esm-framework';
import { usePatientNotes } from '../notes.resource';
import InPatientNote, { InPatientNoteSkeleton } from './note.component';
import styles from './styles.scss';
import { InlineNotification } from '@carbon/react';
import useEmrConfiguration from '../../../hooks/useEmrConfiguration';

interface PatientNotesHistoryProps {
  patientUuid: PatientUuid;
  visitUuid: string;
  promptBeforeClosing: DefaultWorkspaceProps['promptBeforeClosing'];
}

const PatientNotesHistory: React.FC<PatientNotesHistoryProps> = ({ patientUuid, visitUuid, promptBeforeClosing }) => {
  const { t } = useTranslation();
  const { emrConfiguration, isLoadingEmrConfiguration } = useEmrConfiguration();

  const { patientNotes, mutatePatientNotes, isLoadingPatientNotes, errorFetchingPatientNotes } = usePatientNotes(
    patientUuid,
    visitUuid,
    emrConfiguration?.inpatientNoteEncounterType?.uuid,
    emrConfiguration?.consultFreeTextCommentsConcept.uuid,
  );

  const isLoading = isLoadingPatientNotes || isLoadingEmrConfiguration;

  if (!isLoading && patientNotes.length === 0 && !errorFetchingPatientNotes) return null;

  return (
    <div className={styles.notesContainer}>
      <div className={styles.notesContainerHeader}>
        <div className={styles.notesContainerTitle}>History</div>
      </div>
      {isLoading ? [1, 2, 3, 4].map((item, index) => <InPatientNoteSkeleton key={index} />) : null}
      {patientNotes.map((patientNote) => (
        <InPatientNote
          key={patientNote.encounterUuid}
          note={patientNote}
          mutatePatientNotes={mutatePatientNotes}
          promptBeforeClosing={promptBeforeClosing}
        />
      ))}
      {errorFetchingPatientNotes && (
        <InlineNotification
          kind="error"
          title={t('patientNotesDidntLoad', "Patient notes didn't load")}
          subtitle={t(
            'fetchingPatientNotesFailed',
            'Fetching patient notes failed. Try refreshing the page or contact your system administrator.',
          )}
          lowContrast
          hideCloseButton
        />
      )}
    </div>
  );
};

export default PatientNotesHistory;
