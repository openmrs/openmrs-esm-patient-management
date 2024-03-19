import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../../types';
import { voidQueueEntry } from './queue-entry-actions.resource';
import QueueEntryUndoActionsModal from './queue-entry-undo-actions-modal.component';

interface VoidQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const VoidQueueEntryModal: React.FC<VoidQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const modalInstruction = <p>{t('confirmVoidQueueEntry', 'Are you sure you want to void this queue entry?')}</p>;

  return (
    <QueueEntryUndoActionsModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('voidQueueEntry', 'Void Queue Entry'),
        modalInstruction,
        submitButtonText: t('voidQueueEntry', 'Void Queue Entry'),
        submitSuccessTitle: t('queueEntryVoidSuccessful', 'Queue entry voided successfully'),
        submitSuccessText: t('queueEntryVoidSuccessful', 'Queue entry voided successfully'),
        submitFailureTitle: t('queueEntryVoidFailed', 'Error voiding queue entry'),
        submitAction: (queueEntry) => voidQueueEntry(queueEntry.uuid),
      }}
    />
  );
};

export default VoidQueueEntryModal;
