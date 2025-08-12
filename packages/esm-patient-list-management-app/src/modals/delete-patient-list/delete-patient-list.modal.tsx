import React, { useState, useCallback } from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation } from '@openmrs/esm-framework';

interface DeletePatientListModalProps {
  listName?: string;
  listSize?: number;
  onConfirm: () => Promise<void> | void;
  close: () => void;
}

const DeletePatientListModal: React.FC<DeletePatientListModalProps> = ({ listName, listSize, onConfirm, close }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancel = useCallback(() => {
    if (!isDeleting) close();
  }, [close, isDeleting]);

  const handleConfirm = useCallback(async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      close();
    } finally {
      setIsDeleting(false);
    }
  }, [close, onConfirm]);

  return (
    <div>
      <ModalHeader
        closeModal={handleCancel}
        title={t('confirmDeletePatientList', 'Are you sure you want to delete this patient list?')}
      />
      <ModalBody>
        {listSize && listSize > 0 ? (
          <p>
            {t('patientListMemberCount', 'This list has {{count}} patients', {
              count: listSize,
            })}
            .
          </p>
        ) : (
          <p>{t('emptyList', 'This list has no patients')}</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={handleCancel} disabled={isDeleting}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="danger" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? <InlineLoading description={t('deleting', 'Deleting') + '...'} /> : t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeletePatientListModal;
