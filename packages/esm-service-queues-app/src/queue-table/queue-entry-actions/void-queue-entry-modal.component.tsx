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

  const modalInstruction = <p>{t('confirmDeleteQueueEntry', 'Are you sure you want to delete this queue entry?')}</p>;

  return (
    <QueueEntryUndoActionsModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('deleteQueueEntry', 'Delete queue entry'),
        modalInstruction,
        submitButtonText: t('deleteQueueEntry', 'Delete queue entry'),
        submitSuccessTitle: t('queueEntryDeleteSuccessful', 'Queue entry deleted successfully'),
        submitSuccessText: t('queueEntryDeleteSuccessful', 'Queue entry deleted successfully'),
        submitFailureTitle: t('queueEntryDeleteFailed', 'Error deleting queue entry'),
        submitAction: (queueEntry) => voidQueueEntry(queueEntry.uuid),
      }}
    />
  );
};

export default VoidQueueEntryModal;
