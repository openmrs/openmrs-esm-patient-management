import React, { useCallback, useState } from 'react';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, Stack, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { usePatient, useVisit, type Visit } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { type QueueEntry } from '../../types';
import QueueFields from '../../create-queue-entry/queue-fields/queue-fields.component';
import styles from './add-patient-to-queue-entry.scss';
import capitalize from 'lodash/capitalize';

interface AddPatientToQueueModalProps {
  modalTitle: string;
  activeVisit: Visit;
  closeModal: () => void;
}

const AddPatientToQueueModal: React.FC<AddPatientToQueueModalProps> = ({ modalTitle, activeVisit, closeModal }) => {
  const { t } = useTranslation();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callback, setCallback] = useState<{
    submitQueueEntry: (visit: Visit) => Promise<QueueEntry>;
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
        <Button disabled={isSubmitting} kind="primary" type="submit">
          {isSubmitting
            ? t('addingPatientToQueue', 'Adding patient to queue') + '...'
            : t('addPatientToQueue', 'Add patient to queue')}
        </Button>
      </ModalFooter>
    </Form>
  );
};

export default AddPatientToQueueModal;
