import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './clear-queue-entries-dialog.scss';
import { Button, ButtonSkeleton, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { batchClearQueueEntries } from './clear-queue-entries-dialog.resource';
import { MappedVisitQueueEntry, useVisitQueueEntries } from '../active-visits/active-visits-table.resource';

interface ClearQueueEntriesDialogProps {
  visitQueueEntries: Array<MappedVisitQueueEntry>;
  closeModal: () => void;
}

const ClearQueueEntriesDialog: React.FC<ClearQueueEntriesDialogProps> = ({ visitQueueEntries, closeModal }) => {
  const { t } = useTranslation();
  const { mutate } = useVisitQueueEntries('', '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClearQueueBatchRequest = useCallback(() => {
    setIsSubmitting(true);
    batchClearQueueEntries(visitQueueEntries).then(
      (response) => {
        closeModal();
        showToast({
          critical: true,
          title: t('clearQueue', 'Clear queue'),
          kind: 'success',
          description: t('queuesClearedSuccessfully', 'Queues cleared successfully'),
        });
        mutate();
      },
      (error) => {
        showNotification({
          title: t('errorClearingQueues', 'Error clearing queues'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  }, [closeModal, mutate, t, visitQueueEntries]);

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        label={t('serviceQueue', 'Service queue')}
        title={t('clearAllQueueEntries', 'Clear all queue entries?')}
      />
      <ModalBody>
        <p className={styles.subHeading} id="subHeading">
          {t(
            'clearAllQueueEntriesWarningMessage',
            'Clearing all queue entries will remove  all the patients from the queues and will not allow you to fill any other encounter forms for the patients',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        {isSubmitting === true ? (
          <ButtonSkeleton />
        ) : (
          <Button kind="danger" onClick={handleClearQueueBatchRequest}>
            {t('clearQueue', 'Clear queue')}
          </Button>
        )}
      </ModalFooter>
    </div>
  );
};

export default ClearQueueEntriesDialog;
