import React, { useState, useCallback } from 'react';
import { Button, ModalBody, ModalFooter, ModalHeader, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation } from '@openmrs/esm-framework';

interface RemovePatientFromListModalProps {
  patientName: string;
  membershipUuid: string;
  onConfirm: (membershipUuid: string) => Promise<void> | void;
  close: () => void;
}

const RemovePatientFromListModal: React.FC<RemovePatientFromListModalProps> = ({
  patientName,
  membershipUuid,
  onConfirm,
  close,
}) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancel = useCallback(() => {
    if (!isDeleting) {
      close();
    }
  }, [close, isDeleting]);

  const handleConfirm = useCallback(async () => {
    try {
      setIsDeleting(true);
      await onConfirm(membershipUuid);
      close();
    } finally {
      setIsDeleting(false);
    }
  }, [close, onConfirm, membershipUuid]);

  return (
    <div>
      <ModalHeader closeModal={close} title={t('removePatientFromList', 'Remove patient from list')} />
      <ModalBody>
        {t('removePatientFromListConfirmation', 'Are you sure you want to remove {{patientName}} from this list?', {
          patientName,
        })}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={handleCancel} disabled={isDeleting}>
          {getCoreTranslation('cancel')}
        </Button>
        <Button kind="danger" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting ? (
            <InlineLoading description={t('removing', 'Removing') + '...'} />
          ) : (
            t('removeFromList', 'Remove from list')
          )}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default RemovePatientFromListModal;
