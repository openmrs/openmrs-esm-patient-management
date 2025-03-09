import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLatestQueueEntry } from './transition-latest-queue-entry.resource';
import TransitionQueueEntryModal from '../queue-table/queue-entry-actions/transition-queue-entry.modal';
import { showToast, showSnackbar } from '@openmrs/esm-framework';
import { InlineLoading } from '@carbon/react';
import AddPatientToQueueEntry from './add-patient-to-queue-entry/add-patient-to-queue-entry.component';

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
  const { data: queueEntry } = useLatestQueueEntry(patientUuid);

  return (
    <>
      {queueEntry ? (
        <TransitionQueueEntryModal
          queueEntry={queueEntry}
          closeModal={closeModal}
          modalTitle={t('TransitionLatestQueueEntry', "Transition patient's latest queue")}
        />
      ) : (
        <AddPatientToQueueEntry
          modalTitle={t('addPatientToNewQueue', 'Add patient to new queue')}
          patientUuid={patientUuid}
          closeModal={closeModal}
        />
      )}
    </>
  );
};

export default TransitionLatestQueueEntry;
