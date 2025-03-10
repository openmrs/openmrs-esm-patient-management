import { Button, Form, ModalBody, ModalFooter, ModalHeader, Stack } from '@carbon/react';
import { useVisit, type Visit } from '@openmrs/esm-framework';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QueueFields from '../../create-queue-entry/queue-fields/queue-fields.component';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import styles from './add-patient-to-queue-modal.scss';

interface AddPatientToQueueModalProps {
  modalTitle: string;
  patientUuid: string;
  closeModal: () => void;
}

const AddPatientToQueueModal: React.FC<AddPatientToQueueModalProps> = ({ modalTitle, patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { activeVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateQueueEntries } = useMutateQueueEntries();
  const [callback, setCallback] = useState<{
    submitQueueEntry: (visit: Visit) => Promise<any>;
  }>(null);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setIsSubmitting(true);

      callback
        ?.submitQueueEntry?.(activeVisit)
        ?.then(() => {
          closeModal();
          mutateQueueEntries();
        })
        ?.finally(() => {
          setIsSubmitting(false);
        });
    },
    [callback, activeVisit, closeModal, mutateQueueEntries],
  );

  if (isLoadingVisit) {
    return null;
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.container}>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        <div className={styles.queueEntryActionModalBody}>
          <Stack gap={4}>
            <QueueFields setOnSubmit={(onSubmit) => setCallback({ submitQueueEntry: onSubmit })} />
          </Stack>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting} kind="primary">
          {isSubmitting
            ? t('addingPatientToQueue', 'Adding patient to queue') + '...'
            : t('addPatientToQueue', 'Add patient to queue')}
        </Button>
      </ModalFooter>
    </Form>
  );
};

export default AddPatientToQueueModal;
