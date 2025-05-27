import React, { useCallback, useState } from 'react';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, Stack } from '@carbon/react';
import { showSnackbar, type Visit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import QueueFields from '../../create-queue-entry/queue-fields/queue-fields.component';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';

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
    submitQueueEntry: (visit: Visit) => Promise<unknown>;
  } | null>(null);

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
        ?.catch((error) => {
          showSnackbar({
            title: t('queueEntryError', 'Error adding patient to the queue'),
            kind: 'error',
            isLowContrast: false,
            subtitle: error?.message,
          });
        })
        ?.finally(() => {
          setIsSubmitting(false);
        });
    },
    [callback, activeVisit, closeModal, mutateQueueEntries, t],
  );

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <ModalHeader closeModal={closeModal} title={modalTitle} />
        <ModalBody>
          <div>
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
    </>
  );
};

export default AddPatientToQueueModal;
