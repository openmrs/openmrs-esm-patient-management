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
  patientUuid: string;
  closeModal: () => void;
}

const AddPatientToQueueModal: React.FC<AddPatientToQueueModalProps> = ({ modalTitle, patientUuid, closeModal }) => {
  const { t } = useTranslation();
  const { activeVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);
  const { patient } = usePatient(patientUuid);
  const patientName = capitalize(patient?.name[0]?.text);
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

  if (isLoadingVisit) {
    return null;
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.container}>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        <div className={styles.queueEntryActionModalBody}>
          <Stack gap={4}>
            {!activeVisit ? (
              <div className={styles.noActiveVisit}>
                <InlineNotification
                  kind="error"
                  title={t('noActiveVisit', '{{patientName}} does not have an active visit', { patientName })}
                  subtitle={t('unableToAddPatientToQueue', 'Unable to add the patient to the queue')}
                />
              </div>
            ) : (
              <QueueFields setOnSubmit={(onSubmit) => setCallback({ submitQueueEntry: onSubmit })} />
            )}
          </Stack>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={isSubmitting || !activeVisit} kind="primary" type="submit">
          {isSubmitting
            ? t('addingPatientToQueue', 'Adding patient to queue') + '...'
            : t('addPatientToQueue', 'Add patient to queue')}
        </Button>
      </ModalFooter>
    </Form>
  );
};

export default AddPatientToQueueModal;
