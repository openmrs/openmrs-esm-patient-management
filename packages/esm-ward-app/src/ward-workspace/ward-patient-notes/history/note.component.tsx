import React from 'react';
import { type PatientNote } from '../types';
import { SkeletonText, Tag, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import styles from './styles.scss';

export const InPatientNoteSkeleton: React.FC = () => {
  return (
    <Tile className={styles.noteTile} data-testid="in-patient-note-skeleton">
      <div className={styles.noteHeader}>
        <SkeletonText heading width="30%" />
        <SkeletonText width="20%" />
      </div>
      <SkeletonText width="15%" />
      <SkeletonText width="100%" />
      <SkeletonText width="80%" />
    </Tile>
  );
};

interface InPatientNoteProps {
  note: PatientNote;
}

const InPatientNote: React.FC<InPatientNoteProps> = ({ note }) => {
  const { t } = useTranslation();
  const formattedDate = note.encounterNoteRecordedAt
    ? dayjs(note.encounterNoteRecordedAt).format('dddd, D MMM YYYY')
    : '';
  const formattedTime = note.encounterNoteRecordedAt ? dayjs(note.encounterNoteRecordedAt).format('HH:mm') : '';

  return (
    <Tile className={styles.noteTile}>
      <div className={styles.noteHeader}>
        <span className={styles.noteProviderRole}>{t('note', 'Note')}</span>
        <span className={styles.noteDateAndTime}>
          {formattedDate}, {formattedTime}
        </span>
      </div>
      {note.diagnoses &&
        note.diagnoses.split(',').map((diagnosis, index) => (
          <Tag key={index} type="red">
            {diagnosis.trim()}
          </Tag>
        ))}
      <div className={styles.noteBody}>{note.encounterNote}</div>
      <div className={styles.noteProviderName}>{note.encounterProvider}</div>
    </Tile>
  );
};

export default InPatientNote;
