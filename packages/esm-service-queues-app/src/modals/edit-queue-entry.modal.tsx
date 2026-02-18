import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DropdownSkeleton, InlineNotification, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import { convertTime12to24 } from './time-helpers';
import { type QueueEntry } from '../types';
import { updateQueueEntry } from './queue-entry-actions.resource';
import { useMutateQueueEntries } from '../hooks/useQueueEntries';
import { useQueueEntry } from '../hooks/useQueueEntry';
import { useQueues } from '../hooks/useQueues';
import QueueEntryActionModal from './queue-entry-actions-modal.component';

interface EditQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const EditQueueEntryModal: React.FC<EditQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { queues } = useQueues();
  const { queueEntry: freshEntry, error, isLoading } = useQueueEntry(queueEntry.uuid);
  const { mutateQueueEntries } = useMutateQueueEntries();
  const isEnded = !isLoading && !error && (!freshEntry || Boolean(freshEntry.endedAt));

  useEffect(() => {
    if (isEnded) {
      mutateQueueEntries();
    }
  }, [isEnded, mutateQueueEntries]);

  if (isLoading) {
    return (
      <>
        <ModalHeader
          closeModal={closeModal}
          title={t('editQueueEntryForPatient', 'Edit queue entry for {{patient}}', { patient: queueEntry.display })}
        />
        <ModalBody>
          <DropdownSkeleton data-testid="edit-queue-entry-loading-skeleton" />
        </ModalBody>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ModalHeader
          closeModal={closeModal}
          title={t('editQueueEntryForPatient', 'Edit queue entry for {{patient}}', { patient: queueEntry.display })}
        />
        <ModalBody>
          <InlineNotification
            hideCloseButton
            kind="error"
            lowContrast
            title={t('errorLoadingQueueEntry', 'Error loading queue entry')}
            subtitle={error?.message || t('unexpectedError', 'An unexpected error occurred')}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {getCoreTranslation('close')}
          </Button>
        </ModalFooter>
      </>
    );
  }

  if (isEnded) {
    return (
      <>
        <ModalHeader
          closeModal={closeModal}
          title={t('editQueueEntryForPatient', 'Edit queue entry for {{patient}}', { patient: queueEntry.display })}
        />
        <ModalBody>
          <InlineNotification
            hideCloseButton
            kind="warning"
            lowContrast
            title={t('queueEntryAlreadyEnded', 'Queue entry is no longer active')}
            subtitle={t(
              'queueEntryAlreadyEndedMessage',
              'This queue entry has already been completed by another user. The queue has been refreshed.',
            )}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {getCoreTranslation('close')}
          </Button>
        </ModalFooter>
      </>
    );
  }

  return (
    <QueueEntryActionModal
      queueEntry={freshEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('editQueueEntryForPatient', 'Edit queue entry for {{patient}}', {
          patient: freshEntry.display,
        }),
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
            priorityComment: formState.priorityComment,
            ...(formState.modifyDefaultTransitionDateTime ? { startedAt: startAtDate.toISOString() } : {}),
          });
        },
        disableSubmit: () => false,
        isEdit: true,
        showQueuePicker: true,
        showStatusPicker: true,
      }}
    />
  );
};

export default EditQueueEntryModal;
