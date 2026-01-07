import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter } from '@carbon/react';
import { deleteEncounter } from '../../../ward.resource';
import { showSnackbar } from '@openmrs/esm-framework';

interface DeleteEncounterConfirmationProps {
  encounterUuid: string;
  close: () => void;
  onDelete?: () => void;
}

const DeleteEncounterConfirmation: React.FC<DeleteEncounterConfirmationProps> = ({
  close,
  encounterUuid,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const handleCancel = () => close();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteEncounter(encounterUuid);
      showSnackbar({
        kind: 'success',
        title: t('noteDeletedSuccessfully', 'Note deleted successfully'),
      });
      close();
      onDelete?.();
    } catch (e) {
      showSnackbar({
        kind: 'error',
        title: t('errorDeletingNote', 'Error deleting note'),
        subtitle: e?.responseBody?.error?.translatedMessage ?? e?.responseBody?.error?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ModalHeader closeModal={close}>{t('deleteNote', 'Delete note')}?</ModalHeader>
      <ModalBody>
        <p>
          {t('deleteNoteConfirmationText', `Are you sure you want to delete this note? This action can't be undone.`)}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button size="lg" kind="secondary" onClick={handleCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button autoFocus kind="danger" disabled={isDeleting} onClick={handleDelete} size="lg">
          {t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteEncounterConfirmation;
