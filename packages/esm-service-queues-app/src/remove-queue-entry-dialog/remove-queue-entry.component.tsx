import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { parseDate, showSnackbar, useVisit } from '@openmrs/esm-framework';
import { type MappedQueueEntry } from '../types';
import { startOfDay } from '../constants';
import { useCheckedInAppointments, endQueueEntry } from './remove-queue-entry.resource';
import styles from './remove-queue-entry.scss';
import { useMutateQueueEntries } from '../hooks/useMutateQueueEntries';

interface RemoveQueueEntryDialogProps {
  queueEntry: MappedQueueEntry;
  closeModal: () => void;
}

const RemoveQueueEntryDialog: React.FC<RemoveQueueEntryDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(queueEntry.patientUuid);
  const { mutateQueueEntries } = useMutateQueueEntries();

  const { data: appointments } = useCheckedInAppointments(queueEntry.patientUuid, startOfDay);

  const removeQueueEntry = () => {
    const endCurrentVisitPayload = {
      location: currentVisit?.location?.uuid,
      startDatetime: parseDate(currentVisit?.startDatetime),
      visitType: currentVisit?.visitType?.uuid,
      stopDatetime: new Date(),
    };

    const endedAt = new Date();

    endQueueEntry(
      queueEntry.queue.uuid,
      queueEntry.queueEntryUuid,
      endedAt,
      endCurrentVisitPayload,
      queueEntry.visitUuid,
      appointments,
    ).then((response) => {
      closeModal();
      mutateQueueEntries();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        subtitle: t('queueEntryRemovedSuccessfully', `Queue entry removed successfully`),
        title: t('queueEntryRemoved', 'Queue entry removed'),
      });
      (error) => {
        showSnackbar({
          title: t('removeQueueEntryError', 'Error removing queue entry'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      };
    });
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        label={t('serviceQueue', 'Service queue')}
        title={t('removeFromQueueAndEndVisit', 'Remove patient from queue and end active visit?')}
      />
      <ModalBody>
        <p className={styles.subHeading} id="subHeading">
          {t(
            'endVisitWarningMessage',
            'Ending this visit will remove this patient from the queue and will not allow you to fill another encounter form for this patient',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={removeQueueEntry}>
          {t('endVisit', 'End visit')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default RemoveQueueEntryDialog;
