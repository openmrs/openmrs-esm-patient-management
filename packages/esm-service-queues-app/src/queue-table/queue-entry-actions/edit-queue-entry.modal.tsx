import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../../types';
import QueueEntryActionModal from './queue-entry-actions.modal';
import { updateQueueEntry } from './queue-entry-actions.resource';
import { useQueues } from '../../hooks/useQueues';
import { convertTime12to24 } from '../../helpers/time-helpers';

interface EditQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const EditQueueEntryModal: React.FC<EditQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { queues } = useQueues();

  return (
    <QueueEntryActionModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('editQueueEntry', 'Edit queue entry'),
        modalInstruction: t('editQueueEntryInstruction', 'Edit fields of existing queue entry'),
        submitButtonText: t('editQueueEntry', 'Edit queue entry'),
        submitSuccessTitle: t('queueEntryEdited', 'Queue entry edited'),
        submitSuccessText: t('queueEntryEditedSuccessfully', 'Queue entry edited successfully'),
        submitFailureTitle: t('queueEntryEditingFailed', 'Error editing queue entry'),
        submitAction: (queueEntry, formState) => {
          const selectedQueue = queues.find((q) => q.uuid == formState.selectedQueue);
          const statuses = selectedQueue?.allowedStatuses;
          const priorities = selectedQueue?.allowedPriorities;

          const startAtDate = new Date(formState.transitionDate);
          const [hour, minute] = convertTime12to24(formState.transitionTime, formState.transitionTimeFormat);
          startAtDate.setHours(hour, minute, 0, 0);

          return updateQueueEntry(queueEntry.uuid, {
            status: statuses.find((s) => s.uuid == formState.selectedStatus),
            priority: priorities.find((p) => p.uuid == formState.selectedPriority),
            priorityComment: formState.prioritycomment,
            ...(formState.modifyDefaultTransitionDateTime ? { startedAt: startAtDate.toISOString() } : {}),
          });
        },
        disableSubmit: () => false,
        isTransition: false,
      }}
    />
  );
};

export default EditQueueEntryModal;
