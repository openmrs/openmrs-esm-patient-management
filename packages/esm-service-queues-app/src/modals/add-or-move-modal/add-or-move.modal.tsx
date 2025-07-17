import React from 'react';
import { DropdownSkeleton, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Visit } from '@openmrs/esm-framework';
import { useLatestQueueEntry } from './useLatestQueueEntry';
import AddPatientToQueueModal from './add-patient-to-queue.component';
import MoveQueueEntryModal from '../move-queue-entry.modal';

interface AddOrMoveModalProps {
  activeVisit: Visit;
  closeModal: () => void;
}

const AddOrMoveModal: React.FC<AddOrMoveModalProps> = ({ closeModal, activeVisit }) => {
  const patientUuid = activeVisit?.patient?.uuid;
  const { t } = useTranslation();
  const { data: queueEntry, isLoading, error } = useLatestQueueEntry(patientUuid);

  if (isLoading) {
    return <DropdownSkeleton />;
  }

  if (error) {
    return (
      <InlineNotification
        kind="error"
        title={t('errorLoadingQueueEntry', 'Error loading queue entry')}
        subtitle={error?.message || t('unexpectedError', 'An unexpected error occurred')}
        lowContrast
      />
    );
  }

  return (
    <>
      {queueEntry ? (
        <MoveQueueEntryModal
          queueEntry={queueEntry}
          closeModal={closeModal}
          modalTitle={t('transitionLatestQueueEntry', "Transition patient's latest queue entry")}
        />
      ) : (
        <AddPatientToQueueModal
          modalTitle={t('addPatientToQueue', 'Add patient to queue')}
          activeVisit={activeVisit}
          closeModal={closeModal}
        />
      )}
    </>
  );
};

export default AddOrMoveModal;
