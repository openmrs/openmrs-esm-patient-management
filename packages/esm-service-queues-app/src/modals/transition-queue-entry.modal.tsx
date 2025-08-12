import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../types';
import QueueEntryActionModal from './queue-entry-actions-modal.component';
import { transitionQueueEntry } from './queue-entry-actions.resource';
import { convertTime12to24 } from '../helpers/time-helpers';

interface TransitionQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const TransitionQueueEntryModal: React.FC<TransitionQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  return (
    <QueueEntryActionModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('transitionPatient', 'Transition {{patient}}', { patient: queueEntry.display }),
        submitButtonText: t('transition', 'Transition'),
        submitSuccessTitle: t('queueEntryTransitioned', 'Queue entry transitioned'),
        submitSuccessText: t('queueEntryTransitionedSuccessfully', 'Queue entry transitioned successfully'),
        submitFailureTitle: t('queueEntryTransitionFailed', 'Error transitioning queue entry'),
        submitAction: (queueEntry, formState) => {
          const transitionDate = new Date(formState.transitionDate);
          const [hour, minute] = convertTime12to24(formState.transitionTime, formState.transitionTimeFormat);
          transitionDate.setHours(hour, minute, 0, 0);

          return transitionQueueEntry({
            queueEntryToTransition: queueEntry.uuid,
            newQueue: formState.selectedQueue,
            newStatus: formState.selectedStatus,
            newPriority: formState.selectedPriority,
            newPriorityComment: formState.prioritycomment,
            ...(formState.modifyDefaultTransitionDateTime ? { transitionDate: transitionDate.toISOString() } : {}),
          });
        },
        disableSubmit: (queueEntry, formState) =>
          formState.selectedQueue == queueEntry.queue.uuid && formState.selectedStatus == queueEntry.status.uuid,
        isEdit: false,
        showQueuePicker: false,
        showStatusPicker: true,
      }}
    />
  );
};

export default TransitionQueueEntryModal;
