import React from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../../types';
import { updateQueueEntry } from './queue-entry-actions.resource';
import QueueEntryConfirmActionModal from './queue-entry-confirm-action.modal';

interface EndQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const EndQueueEntryModal: React.FC<EndQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const modalInstruction = (
    <p>{t('confirmRemovePatientFromQueue', 'Are you sure you want to remove this patient from this queue?')}</p>
  );

  return (
    <QueueEntryConfirmActionModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('removePatientFromQueue', 'Remove patient from queue'),
        modalInstruction,
        submitButtonText: t('removePatient', 'Remove patient'),
        submitSuccessTitle: t('patientRemoved', 'Patient removed'),
        submitSuccessText: t('patientRemovedSuccessfully', 'Paient removed from queue successfully'),
        submitFailureTitle: t('patientRemovedFailed', 'Error removing patient from queue'),
        submitAction: (queueEntry) =>
          updateQueueEntry(queueEntry.uuid, {
            endedAt: new Date().toISOString(),
          }),
      }}
    />
  );
};

export default EndQueueEntryModal;
