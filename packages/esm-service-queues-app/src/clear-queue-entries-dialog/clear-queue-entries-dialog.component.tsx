import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './clear-queue-entries-dialog.scss';
import { Button, ButtonSkeleton, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { batchClearQueueEntries } from './clear-queue-entries-dialog.resource';
import { type MappedVisitQueueEntry, useVisitQueueEntries } from '../active-visits/active-visits-table.resource';

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
        showSnackbar({
          isLowContrast: true,
          title: t('clearQueue', 'Clear queue'),
          kind: 'success',
          subtitle: t('queuesClearedSuccessfully', 'Queues cleared successfully'),
        });
        mutate();
      },
      (error) => {
        showSnackbar({
          title: t('errorClearingQueues', 'Error clearing queues'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
        closeModal();
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
            'Clearing all queue entries will remove  all the patients from the queues',
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
