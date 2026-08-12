import React, { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalHeader, ModalBody, ModalFooter, Stack } from '@carbon/react';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import { type QueueEntry } from '../types';
import { useMutateQueueEntries } from '../hooks/useQueueEntries';
import { getErrorMessage, isAlreadyEndedQueueEntryError } from './queue-entry-error.utils';

interface QueueEntryUndoActionsModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
  modalParams: ModalParams;
  showPatientName: boolean;
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
// Modal for confirming a queue entry action that does not require additional form fields / inputs from user
// Used by UndoTransitionQueueEntryModal, VoidQueueEntryModal and EndQueueEntryModal
export const QueueEntryConfirmActionModal: React.FC<QueueEntryUndoActionsModalProps> = ({
  queueEntry,
  closeModal,
  modalParams,
  showPatientName,
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
        if (isAlreadyEndedQueueEntryError(error)) {
          showSnackbar({
            title: t('queueEntryAlreadyEnded', 'Queue entry is no longer active'),
            kind: 'warning',
            subtitle: t(
              'queueEntryAlreadyEndedMessage',
              'This queue entry has already been completed by another user. The queue has been refreshed.',
            ),
          });
          mutateQueueEntries();
          closeModal();
        } else {
          showSnackbar({
            title: submitFailureTitle,
            kind: 'error',
            subtitle: getErrorMessage(error) || t('unknownError', 'An unknown error occurred'),
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <ModalHeader closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        {showPatientName ? (
          <Stack gap={4}>
            <h5>{queueEntry.display}</h5>
            <span>{modalInstruction}</span>
          </Stack>
        ) : (
          <div>{modalInstruction}</div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" disabled={isSubmitting} onClick={submitForm}>
          {submitButtonText}
        </Button>
      </ModalFooter>
    </>
  );
};

export default QueueEntryConfirmActionModal;
