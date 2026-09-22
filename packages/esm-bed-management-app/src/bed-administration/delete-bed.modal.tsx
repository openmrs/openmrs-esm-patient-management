import React, { useRef, useState } from 'react';
import {
  Button,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@carbon/react';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type Bed } from '../types';
import { deleteBed } from './form/bed-form.resource';

interface DeleteBedModalProps {
  bed: Bed;
  closeModal: () => void;
  mutateBeds: () => void;
}

const DeleteBedModal: React.FC<DeleteBedModalProps> = ({ bed, closeModal, mutateBeds }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const submitting = useRef(false);
  const occupied = bed.status === 'OCCUPIED';

  const handleDelete = async () => {
    if (submitting.current || occupied || !reason.trim() || reason.trim().length > 255) {
      return;
    }

    submitting.current = true;
    setIsDeleting(true);
    setErrorMessage('');

    try {
      await deleteBed(bed.uuid, reason.trim());
    } catch (error) {
      setErrorMessage(
        error?.responseBody?.error?.message ||
          error?.message ||
          t('deleteBedErrorFallback', 'Unable to delete this bed. Please try again.'),
      );
      submitting.current = false;
      setIsDeleting(false);
      return;
    }

    showSnackbar({
      kind: 'success',
      title: t('bedDeleted', 'Bed deleted'),
      subtitle: t('bedDeletedSuccessfully', 'Bed {{bedNumber}} has been deleted.', { bedNumber: bed.bedNumber }),
    });
    mutateBeds();
    closeModal();
  };

  return (
    <>
      <ModalHeader closeModal={isDeleting ? undefined : closeModal} title={t('deleteBed', 'Delete bed')} />
      <ModalBody>
        <p>
          {t('deleteBedConfirmation', 'Are you sure you want to delete bed {{bedNumber}}?', {
            bedNumber: bed.bedNumber,
          })}
        </p>
        {occupied && (
          <InlineNotification
            kind="warning"
            title={t('cannotDeleteOccupiedBed', 'Occupied beds cannot be deleted')}
            hideCloseButton
          />
        )}
        {errorMessage && (
          <InlineNotification
            kind="error"
            title={t('errorDeletingBed', 'Error deleting bed')}
            subtitle={errorMessage}
            hideCloseButton
          />
        )}
        <TextInput
          id="delete-bed-reason"
          labelText={t('reasonForDeletingBed', 'Reason for deleting the bed')}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={255}
          required
          disabled={isDeleting || occupied}
        />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal} disabled={isDeleting}>
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={handleDelete} disabled={isDeleting || occupied || !reason.trim()}>
          {isDeleting ? (
            <InlineLoading description={t('deletingBed', 'Deleting bed...')} />
          ) : (
            getCoreTranslation('delete', 'Delete')
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteBedModal;
