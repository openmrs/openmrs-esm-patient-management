import React from 'react';
import { Tag } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { DiagnosisItem, Note } from '../../types/index';
import styles from './past-visit-summary.scss';

interface NotesProps {
  notes: Array<Note>;
  diagnoses: Array<DiagnosisItem>;
}

const Notes: React.FC<NotesProps> = ({ notes, diagnoses }) => {
  const { t } = useTranslation();

  return (
    <div>
      {diagnoses.length > 0
        ? diagnoses.map((d: DiagnosisItem, ind) => (
            <Tag type="blue" size="md">
              {d.diagnosis}
            </Tag>
          ))
        : null}
      {notes.length ? (
        notes.map((note: Note, i) => (
          <div>
            <p className={styles.notesContainer}>{note.note}</p>
            <p className={styles.notesSubHeading}>
              {note.provider.name ? <span> {note.provider.name} </span> : null} · {note.time}
            </p>
          </div>
        ))
      ) : (
        <p className={`${styles.bodyLong01} ${styles.text02}`}>{t('noNotesFound', 'No notes found')}</p>
      )}
    </div>
  );
};

export default Notes;
