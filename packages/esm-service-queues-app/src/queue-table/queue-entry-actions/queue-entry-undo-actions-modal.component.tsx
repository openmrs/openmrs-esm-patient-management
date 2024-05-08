import React, { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../../types';
import { Button, ModalHeader, ModalBody, ModalFooter, Stack } from '@carbon/react';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useMutateQueueEntries';

interface QueueEntryUndoActionsModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
  modalParams: ModalParams;
}

interface ModalParams {
  modalTitle: string;
  modalInstruction: ReactNode;
  submitButtonText: string;
  submitSuccessTitle: string;
  submitSuccessText: string;
  submitFailureTitle: string;
  submitAction: (queueEntry: QueueEntry) => Promise<FetchResponse<any>>;
}
// Modal with the same UI for undoing a queue entry transition and voiding a queue entry
export const QueueEntryUndoActionsModal: React.FC<QueueEntryUndoActionsModalProps> = ({
  queueEntry,
  closeModal,
  modalParams,
}) => {
  const { t } = useTranslation();
  const { mutateQueueEntries } = useMutateQueueEntries();
  const {
    modalTitle,
    modalInstruction,
    submitButtonText,
    submitSuccessTitle,
    submitSuccessText,
    submitFailureTitle,
    submitAction,
  } = modalParams;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    submitAction(queueEntry)
      .then(({ status }) => {
        const success = status >= 200 && status < 300;
        if (success) {
          showSnackbar({
            isLowContrast: true,
            title: submitSuccessTitle,
            kind: 'success',
            subtitle: submitSuccessText,
          });
          mutateQueueEntries();
          closeModal();
        } else {
          throw { message: t('unexpectedServerResponse', 'Unexpected Server Response') };
        }
      })
      .catch((error) => {
        showSnackbar({
          title: submitFailureTitle,
          kind: 'error',
          subtitle: error?.message,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        <Stack gap={4}>
          <h5>{queueEntry.display}</h5>
          {modalInstruction}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={isSubmitting} onClick={submitForm}>
          {submitButtonText}
        </Button>
      </ModalFooter>
    </>
  );
};

export default QueueEntryUndoActionsModal;
