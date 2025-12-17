import React, { useState } from 'react';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import styles from './delete-bed-confirmation.scss';
import { deleteBed } from '../../summary/summary.resource';

interface DeleteBedParams {
  closeModal: () => void;
  uuid: string;
  mutateBeds: () => void;
}

const DeleteBed: React.FC<DeleteBedParams> = ({ closeModal, uuid, mutateBeds }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      await deleteBed(uuid);
      mutateBeds();

      showSnackbar({
        title: t('bedDeleted', 'Bed deleted'),
        subtitle: t('bedDeleteSuccess', 'Bed deleted successfully'),
        kind: 'success',
      });
    } catch (err: any) {
      const message =
        err?.responseBody?.error?.message ||
        err?.message ||
        t('deleteFailedTryAgain', 'Unable to delete bed. Please try again.');

      showSnackbar({
        title: t('bedDeleteFailed', 'Failed to delete bed'),
        subtitle: message,
        kind: 'error',
      });
    } finally {
      setIsDeleting(false);
      closeModal();
    }
  };

  return (
    <>
      <ModalHeader className={styles.sectionTitle} closeModal={closeModal} title={t('deleteBed', 'Delete bed')} />

      <ModalBody className={styles.modalBody}>
        <p>{t('deleteConfirmation', 'Are you sure you want to delete this bed?')}</p>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {getCoreTranslation('cancel')}
        </Button>

        <Button kind="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading className={styles.spinner} description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{getCoreTranslation('delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteBed;
