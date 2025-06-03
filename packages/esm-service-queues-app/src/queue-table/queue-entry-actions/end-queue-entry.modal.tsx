import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { type QueueEntry } from '../../types';
import { updateQueueEntry } from './queue-entry-actions.resource';
import QueueEntryConfirmActionModal from './queue-entry-confirm-action.modal';

interface EndQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const EndQueueEntryModal: React.FC<EndQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const patient = queueEntry.display;
  const queue = queueEntry.queue.display;
  const modalInstruction = (
    <Trans i18nKey="confirmRemovePatientFromQueue">
      Are you sure you want to remove <strong>{{ patient } as any}</strong> from {{ queue }}?
    </Trans>
  );

  return (
    <QueueEntryConfirmActionModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('removePatientFromQueue', 'Remove patient from queue?'),
        modalInstruction,
        submitButtonText: t('remove', 'Remove'),
        submitSuccessTitle: t('patientRemoved', 'Patient removed'),
        submitSuccessText: t('patientRemovedSuccessfully', 'Patient removed from queue successfully'),
        submitFailureTitle: t('patientRemovedFailed', 'Error removing patient from queue'),
        submitAction: (queueEntry) =>
          updateQueueEntry(queueEntry.uuid, {
            endedAt: new Date().toISOString(),
          }),
      }}
      isRemovingPatientFromQueue
    />
  );
};

export default EndQueueEntryModal;
