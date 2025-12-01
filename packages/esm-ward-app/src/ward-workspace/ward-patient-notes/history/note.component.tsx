import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SkeletonText, Tag, Tile , OverflowMenu , OverflowMenuItem , Stack , TextArea , Button , Layer } from '@carbon/react';
import { type DefaultWorkspaceProps, isDesktop, showModal, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { type PatientNote } from '../types';
import { editPatientNotes } from '../notes.resource';
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
  mutatePatientNotes(): void;
  note: PatientNote;
  promptBeforeClosing: DefaultWorkspaceProps['promptBeforeClosing'];
}

const InPatientNote: React.FC<InPatientNoteProps> = ({ note, mutatePatientNotes, promptBeforeClosing }) => {
  const { t } = useTranslation();
  const formattedDate = note.encounterNoteRecordedAt
    ? dayjs(note.encounterNoteRecordedAt).format('dddd, D MMM YYYY')
    : '';
  const formattedTime = note.encounterNoteRecordedAt ? dayjs(note.encounterNoteRecordedAt).format('HH:mm') : '';
  const [editMode, setEditMode] = useState(false);
  const [editedNote, setEditedNote] = useState(note.encounterNote);
  const isTablet = !isDesktop(useLayoutType());

  useEffect(() => {
    promptBeforeClosing(() => editMode);
    return () => promptBeforeClosing(null);
  }, [editMode, promptBeforeClosing]);

  return (
    <div className={styles.noteTile}>
      <Stack gap={4}>
        <div className={styles.noteHeader}>
          <span className={styles.noteDateAndTime}>
            {formattedDate}, {formattedTime}
          </span>
          <OverflowMenu className={styles.overflowMenu} flipped>
            {!editMode && (
              <OverflowMenuItem
                aria-label={t('edit', 'Edit')}
                id={'edit note-' + note.encounterUuid}
                className={styles.menuItem}
                hasDivider
                itemText={t('edit', 'Edit')}
                onClick={() => {
                  setEditMode(true);
                }}
              />
            )}
            <OverflowMenuItem
              aria-label={t('delete', 'Delete')}
              id={'delete-note-' + note.encounterUuid}
              isDelete
              className={styles.menuItem}
              hasDivider
              itemText={t('delete', 'Delete')}
              onClick={() => {
                const dispose = showModal('delete-note-modal', {
                  close: () => dispose(),
                  encounterUuid: note.encounterUuid,
                  onDelete: () => mutatePatientNotes(),
                });
              }}
            />
          </OverflowMenu>
        </div>
        {editMode ? (
          <Layer>
            <Stack gap={3}>
              <TextArea
                className={styles.textArea}
                rows={6}
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
              />
              <div className={styles.editButtons}>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setEditedNote(note.encounterNote); // Reset to original note on cancel
                  }}
                  kind={'secondary'}
                  size={isTablet ? 'lg' : 'sm'}>
                  {t('cancel', 'Cancel')}
                </Button>
                <Button
                  onClick={async () => {
                    await editPatientNotes(note.obsUuid, editedNote);
                    setEditMode(false);
                    showSnackbar({
                      isLowContrast: true,
                      kind: 'success',
                      subtitle: t('patientNoteNowVisible', 'It should be now visible in the notes history'),
                      title: t('visitNoteSaved', 'Patient note saved'),
                    });
                    mutatePatientNotes();
                  }}
                  kind={'primary'}
                  size={isTablet ? 'lg' : 'sm'}>
                  {t('save', 'Save')}
                </Button>
              </div>
            </Stack>
          </Layer>
        ) : (
          <>
            {note.diagnoses && (
              <div>
                {note.diagnoses.split(',').map((diagnosis, index) => (
                  <Tag key={index} type="red">
                    {diagnosis.trim()}
                  </Tag>
                ))}
              </div>
            )}
            <div className={styles.noteBody}>{note.encounterNote}</div>
            <div className={styles.noteProviderName}>{note.encounterProvider}</div>
          </>
        )}
      </Stack>
    </div>
  );
};

export default InPatientNote;
