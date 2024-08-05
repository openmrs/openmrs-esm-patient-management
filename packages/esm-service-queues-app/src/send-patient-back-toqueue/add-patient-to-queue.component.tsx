import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import QueueEntryActionModal from '../queue-table/queue-entry-actions/queue-entry-actions.modal';
import { useQueueEntry } from './add-patient-to-queue.resource';
import { transitionQueueEntry } from '../queue-table/queue-entry-actions/queue-entry-actions.resource';
import { convertTime12to24 } from '../helpers/time-helpers';
import { showSnackbar } from '@openmrs/esm-framework';
import { Loading } from '@carbon/react';

interface AddPatientToQueueProps {
  patientUuid: string;
  closeModal: () => void;
}

const AddPatientToQueue: React.FC<AddPatientToQueueProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const { data: queueEntry, error, isLoading } = useQueueEntry(patientUuid);

  if (error || !queueEntry) {
    return null;
  }

  return (
    <QueueEntryActionModal
      queueEntry={queueEntry}
      closeModal={closeModal}
      modalParams={{
        modalTitle: t('addPatientToQueue', 'Add patient to queue'),
        modalInstruction: t(
          'transitionPatientStatusOrQueue',
          'Select a new status or queue for patient to transition to.',
        ),
        submitButtonText: t('addPatientToQueue', 'Add patient to queue'),
        submitSuccessTitle: t('addPatientToQueue', 'Add patient to queue'),
        submitSuccessText: t('addPatientToQueueEntryTransitionedSuccessfully', 'Patient has transitioned successfully'),
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
          formState.selectedQueue === queueEntry.queue.uuid && formState.selectedStatus === queueEntry.status.uuid,
        isTransition: true,
      }}
    />
  );
};

export default AddPatientToQueue;
