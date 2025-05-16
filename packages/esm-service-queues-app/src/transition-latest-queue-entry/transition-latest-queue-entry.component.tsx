import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLatestQueueEntry } from './transition-latest-queue-entry.resource';
import AddPatientToQueueModal from './add-patient-to-queue-modal/add-patient-to-queue.modal';
import TransitionQueueEntryModal from '../queue-table/queue-entry-actions/transition-queue-entry.modal';
import { type Visit } from '@openmrs/esm-framework';

interface TransitionQueueProps {
  activeVisit: Visit;
  closeModal: () => void;
}

const TransitionQueue: React.FC<TransitionQueueProps> = ({ closeModal, activeVisit }) => {
  const patientUuid = activeVisit?.patient?.uuid;
  const { t } = useTranslation();
  const { data: queueEntry } = useLatestQueueEntry(patientUuid);

  return (
    <>
      {queueEntry ? (
        <TransitionQueueEntryModal
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

export default TransitionQueue;
