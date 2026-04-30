import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  SkeletonText,
  Tile,
  OverflowMenu,
  OverflowMenuItem,
  Stack,
  TextArea,
  Button,
  Layer,
  InlineLoading,
} from '@carbon/react';
import {
  getCoreTranslation,
  isDesktop,
  showModal,
  showSnackbar,
  useEmrConfiguration,
  useLayoutType,
} from '@openmrs/esm-framework';
import { type PatientNote } from '../types';
import { editPatientNote } from '../notes.resource';
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
  promptBeforeClosing(hasUnsavedChanges: boolean): void;
}

/**
 * This component shows a note (obs) created with concept as either:
 * - `consultFreeTextCommentsConcept` from emrapi configuration
 * - one of the concepts defined in additionalInpatientNotesConceptUuids.
 *
 * Note that only notes with encounter type emrConfiguration.inpatientNoteEncounterType are creatable,
 * editable and deletable from the ward app.
 *
 */
const InPatientNote: React.FC<InPatientNoteProps> = ({ note, mutatePatientNotes, promptBeforeClosing }) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [editedNote, setEditedNote] = useState(note.encounterNote);
  const isTablet = !isDesktop(useLayoutType());
  const [isSaving, setIsSaving] = useState(false);
  const { emrConfiguration } = useEmrConfiguration();
  const isInpatientNoteEncounter = note.encounterTypeUuid === emrConfiguration?.inpatientNoteEncounterType?.uuid;

  useEffect(() => {
    promptBeforeClosing(editMode);
  }, [editMode, promptBeforeClosing]);

  const onSave = async () => {
    try {
      setIsSaving(true);
      await editPatientNote(note.obsUuid, editedNote);
      setEditMode(false);
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('patientNoteNowVisible', 'It should be now visible in the notes history'),
        title: t('visitNoteSaved', 'Patient note saved'),
      });
      mutatePatientNotes();
    } catch (e) {
      showSnackbar({
        isLowContrast: true,
        kind: 'error',
        subtitle: e?.responseBody?.error?.translatedMessage ?? e?.responseBody?.error?.message,
        title: t('errorSavingPatientNote', 'Error saving patient note'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.noteTile}>
      <Stack gap={4}>
        <div className={styles.noteHeader}>
          {isInpatientNoteEncounter && (
            <OverflowMenu className={styles.overflowMenu} flipped>
              {!editMode && note.obsUuid && (
                <OverflowMenuItem
                  aria-label={getCoreTranslation('edit')}
                  id={'edit note-' + note.encounterUuid}
                  className={styles.menuItem}
                  hasDivider
                  itemText={getCoreTranslation('edit')}
                  onClick={() => {
                    setEditMode(true);
                  }}
                />
              )}
              {note.isEdited && (
                <OverflowMenuItem
                  aria-label={t('viewEditHistory', 'View edit history')}
                  id={'view-history-' + note.encounterUuid}
                  className={styles.menuItem}
                  itemText={t('viewEditHistory', 'View edit history')}
                  onClick={() => {
                    const dispose = showModal('note-history-modal', {
                      close: () => dispose(),
                      note,
                    });
                  }}
                />
              )}
              <OverflowMenuItem
                aria-label={getCoreTranslation('delete')}
                id={'delete-note-' + note.encounterUuid}
                isDelete
                className={styles.menuItem}
                itemText={getCoreTranslation('delete')}
                onClick={() => {
                  const dispose = showModal('delete-note-modal', {
                    close: () => dispose(),
                    encounterUuid: note.encounterUuid,
                    onDelete: () => mutatePatientNotes(),
                  });
                }}
              />
            </OverflowMenu>
          )}
        </div>
        {editMode ? (
          <Layer>
            <Stack gap={3}>
              <TextArea
                className={styles.textArea}
                id="editNote"
                rows={6}
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                labelText={t('editNote', 'Edit note')}
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
                <Button onClick={onSave} kind={'primary'} size={isTablet ? 'lg' : 'sm'}>
                  {isSaving ? <InlineLoading description={t('saving', 'Saving...')} /> : t('saveEdit', 'Save edit')}
                </Button>
              </div>
            </Stack>
          </Layer>
        ) : (
          <>
            <div className={styles.noteBody}>{note.encounterNote}</div>
            <div className={styles.noteProviderName}>
              {t('writtenBy', 'Written by: {{name}}, {{date}}', {
                name: note.encounterProvider,
                date: dayjs(note.encounterNoteRecordedAt).format('D MMM YYYY, HH:mm'),
              })}
            </div>
            {note.isEdited && note.lastEditedBy && (
              <div className={styles.noteEditedBy}>
                {t('lastEditedBy', 'Last edited by: {{name}}, {{date}}', {
                  name: note.lastEditedBy,
                  date: dayjs(note.lastEditedAt).format('D MMM YYYY, HH:mm'),
                })}
              </div>
            )}
          </>
        )}
      </Stack>
    </div>
  );
};

export default InPatientNote;
