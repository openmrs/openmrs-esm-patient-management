import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLatestQueueEntry } from './transition-latest-queue-entry.resource';
import TransitionQueueEntryModal from '../queue-table/queue-entry-actions/transition-queue-entry.modal';

interface TransitionLatestQueueEntryProps {
  patientUuid: string;
  closeModal: () => void;
  modalTitle?: string;
}

const TransitionLatestQueueEntry: React.FC<TransitionLatestQueueEntryProps> = ({
  closeModal,
  patientUuid,
  modalTitle,
}) => {
  const { t } = useTranslation();
  const { data: queueEntry, error, isLoading } = useLatestQueueEntry(patientUuid);

  if (error || !queueEntry) {
    return null;
  }

  return (
    <TransitionQueueEntryModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalTitle={t('TransitionLatestQueueEntry', "Transition patient's latest queue")}
    />
  );
};

export default TransitionLatestQueueEntry;
