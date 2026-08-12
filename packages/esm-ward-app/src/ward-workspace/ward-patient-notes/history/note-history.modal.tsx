import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { ModalHeader, ModalBody } from '@carbon/react';
import { type PatientNote } from '../types';
import styles from './styles.scss';
import modalStyles from './note-history.modal.scss';
import classNames from 'classnames';

interface NoteHistoryModalProps {
  close: () => void;
  note: PatientNote;
}

const NoteHistoryModal: React.FC<NoteHistoryModalProps> = ({ close, note }) => {
  const { t } = useTranslation();

  const formatDate = (datetime: string) => dayjs(datetime).format('D MMM YYYY, HH:mm');

  const versions = [
    { note: note.encounterNote, recordedAt: note.lastEditedAt, recordedBy: note.lastEditedBy },
    ...note.editHistory.map((v) => ({ note: v.note, recordedAt: v.recordedAt, recordedBy: v.recordedBy })),
  ];

  return (
    <>
      <ModalHeader closeModal={close}>{t('noteEditHistory', 'Note edit history')}</ModalHeader>
      <ModalBody>
        <div className={styles.notesContainer}>
          {versions.map((v, i) => (
            <div key={i} className={classNames(styles.noteTile, modalStyles.versionTile)}>
              <div className={styles.noteBody}>{v.note}</div>
              <div className={styles.noteProviderName}>
                {t('writtenBy', 'Written by: {{name}}, {{date}}', {
                  name: v.recordedBy,
                  date: formatDate(v.recordedAt),
                })}
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </>
  );
};

export default NoteHistoryModal;
