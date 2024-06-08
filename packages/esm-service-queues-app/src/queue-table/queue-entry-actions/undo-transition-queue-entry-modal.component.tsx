import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../../types';
import { undoTransition } from './queue-entry-actions.resource';
import QueueEntryConfirmActionModal from './queue-entry-confirm-action-modal.component';

interface UndoTransitionQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const UndoTransitionQueueEntryModal: React.FC<UndoTransitionQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { previousQueueEntry, queueComingFrom } = queueEntry;

  const previousEntrySameQueue = queueComingFrom.uuid == queueEntry.queue.uuid;
  const modalInstruction = previousEntrySameQueue ? (
    <p>
      {t('confirmMoveBackStatus', 'Are you sure you want to move patient back to status "{{status}}"?', {
        status: previousQueueEntry.status.display,
        interpolation: { escapeValue: false },
      })}
    </p>
  ) : (
    <p>
      {t(
        'confirmMoveBackQueueAndStatus',
        'Are you sure you want to move patient back to queue "{{queue}}" with status "{{status}}"?',
        {
          queue: queueComingFrom.display,
          status: previousQueueEntry.status.display,
          interpolation: { escapeValue: false },
        },
      )}
    </p>
  );

  return (
    <QueueEntryConfirmActionModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('undoTransition', 'Undo transition'),
        modalInstruction,
        submitButtonText: t('undoTransition', 'Undo transition'),
        submitSuccessTitle: t('undoQueueEntryTransitionSuccess', 'Undo transition success'),
        submitSuccessText: t('queueEntryTransitionUndoSuccessful', 'Queue entry transition undo success'),
        submitFailureTitle: t('queueEntryTransitionUndoFailed', 'Error undoing transition'),
        submitAction: (queueEntry) =>
          undoTransition({
            queueEntry: queueEntry.uuid,
          }),
      }}
    />
  );
};

export default UndoTransitionQueueEntryModal;
