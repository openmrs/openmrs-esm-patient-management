import React from 'react';
import { InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import InPatientNote, { InPatientNoteSkeleton } from './note.component';
import { type PatientNote } from '../types';
import styles from './styles.scss';

interface PatientNotesHistoryProps {
  patientNotes: Array<PatientNote>;
  mutatePatientNotes: () => void;
  isLoading: boolean;
  errorFetchingPatientNotes: Error;
  promptBeforeClosing(hasUnsavedChanges: boolean): void;
}

const PatientNotesHistory: React.FC<PatientNotesHistoryProps> = ({
  patientNotes,
  mutatePatientNotes,
  isLoading,
  errorFetchingPatientNotes,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();

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
