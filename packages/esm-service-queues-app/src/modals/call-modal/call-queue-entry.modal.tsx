import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader, Tag } from '@carbon/react';
import { navigate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { mapVisitQueueEntryProperties, serveQueueEntry, updateQueueEntry } from '../../service-queues.resource';
import { requeueQueueEntry } from './call-queue-entry.resource';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { type QueueEntry } from '../../types';
import styles from './call-queue-entry.scss';

interface CallQueueEntryModalProps {
  closeModal: () => void;
  queueEntry: QueueEntry;
}

enum priorityComment {
  REQUEUED = 'Requeued',
}

const CallQueueEntryModal: React.FC<CallQueueEntryModalProps> = ({ closeModal, queueEntry }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const defaultTransitionStatus = config.concepts.defaultTransitionStatus;

  const mappedQueueEntry = mapVisitQueueEntryProperties(queueEntry, config.visitQueueNumberAttributeUuid);

  const preferredIdentifiers = mappedQueueEntry.identifiers.filter((identifier) =>
    config.defaultIdentifierTypes.includes(identifier?.identifierType?.uuid),
  );

  const { mutateQueueEntries } = useMutateQueueEntries();

  const launchEditPriorityModal = useCallback(() => {
    const endedAt = new Date();
    updateQueueEntry(
      mappedQueueEntry.visitUuid,
      mappedQueueEntry.queueUuid,
      mappedQueueEntry.queueUuid,
      mappedQueueEntry.queueEntryUuid,
      mappedQueueEntry.patientUuid,
      mappedQueueEntry.priority?.uuid,
      defaultTransitionStatus,
      endedAt,
      mappedQueueEntry.sortWeight,
    ).then(
      () => {
        serveQueueEntry(mappedQueueEntry.queue.name, mappedQueueEntry.visitQueueNumber, 'serving').then(
          ({ status }) => {
            showSnackbar({
              isLowContrast: true,
              title: t('success', 'Success'),
              kind: 'success',
              subtitle: t('patientAttendingService', 'Patient attending service'),
            });
            closeModal();
            mutateQueueEntries();
            navigate({ to: `\${openmrsSpaBase}/patient/${mappedQueueEntry.patientUuid}/chart` });
          },
        );
      },
      (error) => {
        showSnackbar({
          title: t('queueEntryUpdateFailed', 'Error updating queue entry'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  }, [
    closeModal,
    defaultTransitionStatus,
    mutateQueueEntries,
    mappedQueueEntry.patientUuid,
    mappedQueueEntry.priority?.uuid,
    mappedQueueEntry.queue.name,
    mappedQueueEntry.queueEntryUuid,
    mappedQueueEntry.queueUuid,
    mappedQueueEntry.sortWeight,
    mappedQueueEntry.visitQueueNumber,
    mappedQueueEntry.visitUuid,
    t,
  ]);

  const handleRequeuePatient = useCallback(() => {
    requeueQueueEntry(priorityComment.REQUEUED, mappedQueueEntry.queueUuid, mappedQueueEntry.queueEntryUuid).then(
      () => {
        showSnackbar({
          isLowContrast: true,
          title: t('success', 'Success'),
          kind: 'success',
          subtitle: t('patientRequeued', 'Patient has been requeued'),
        });
        closeModal();
        mutateQueueEntries();
      },
      (error) => {
        showSnackbar({
          title: t('queueEntryUpdateFailed', 'Error updating queue entry'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  }, [closeModal, mutateQueueEntries, mappedQueueEntry.queueEntryUuid, mappedQueueEntry.queueUuid, t]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('servePatient', 'Serve patient')} />
      <ModalBody className={styles.modalBody}>
        <div>
          <section className={styles.modalBody}>
            <p className={styles.p}>
              {t('patientName', 'Patient name')}: &nbsp; {mappedQueueEntry.name}
            </p>
            {preferredIdentifiers?.length
              ? preferredIdentifiers.map((identifier) => (
                  <p className={styles.p}>
                    {identifier?.identifierType?.display} : &nbsp; {identifier?.identifier}
                  </p>
                ))
              : ''}
            <p className={styles.p}>
              {t('patientGender', 'Gender')}: &nbsp; {mappedQueueEntry.patientGender}
            </p>
            <p className={styles.p}>
              {t('patientAge', 'Age')}: &nbsp; {mappedQueueEntry.patientAge}
            </p>
            <div>
              {mappedQueueEntry.identifiers?.map((identifier) => (
                <Tag key={identifier.uuid}>{identifier.display}</Tag>
              ))}
            </div>
          </section>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={() => handleRequeuePatient()}>
          {t('requeue', 'Requeue')}
        </Button>
        <Button onClick={() => launchEditPriorityModal()}>{t('serve', 'Serve')}</Button>
      </ModalFooter>
    </div>
  );
};

export default CallQueueEntryModal;
