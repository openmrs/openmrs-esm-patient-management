import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader, Tag } from '@carbon/react';
import { navigate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import {
  type MappedVisitQueueEntry,
  serveQueueEntry,
  updateQueueEntry,
} from '../active-visits/active-visits-table.resource';
import { requeueQueueEntry } from './transition-queue-entry.resource';
import { useMutateQueueEntries } from '../hooks/useQueueEntries';
import styles from './transition-queue-entry-dialog.scss';

interface TransitionQueueEntryModalProps {
  closeModal: () => void;
  queueEntry: MappedVisitQueueEntry;
}

enum priorityComment {
  REQUEUED = 'Requeued',
}

const TransitionQueueEntryModal: React.FC<TransitionQueueEntryModalProps> = ({ closeModal, queueEntry }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const defaultTransitionStatus = config.concepts.defaultTransitionStatus;

  const preferredIdentifiers = queueEntry?.identifiers.filter((identifier) =>
    config.defaultIdentifierTypes.includes(identifier?.identifierType?.uuid),
  );

  const { mutateQueueEntries } = useMutateQueueEntries();

  const launchEditPriorityModal = useCallback(() => {
    const endedAt = new Date();
    updateQueueEntry(
      queueEntry?.visitUuid,
      queueEntry?.queueUuid,
      queueEntry?.queueUuid,
      queueEntry?.queueEntryUuid,
      queueEntry?.patientUuid,
      queueEntry?.priority?.uuid,
      defaultTransitionStatus,
      endedAt,
      queueEntry?.sortWeight,
    ).then(
      ({ status }) => {
        serveQueueEntry(queueEntry?.queue.name, queueEntry?.visitQueueNumber, 'serving').then(({ status }) => {
          showSnackbar({
            isLowContrast: true,
            title: t('success', 'Success'),
            kind: 'success',
            subtitle: t('patientAttendingService', 'Patient attending service'),
          });
          closeModal();
          mutateQueueEntries();
          navigate({ to: `\${openmrsSpaBase}/patient/${queueEntry?.patientUuid}/chart` });
        });
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
    queueEntry?.patientUuid,
    queueEntry?.priority?.uuid,
    queueEntry?.queue.name,
    queueEntry?.queueEntryUuid,
    queueEntry?.queueUuid,
    queueEntry?.sortWeight,
    queueEntry?.visitQueueNumber,
    queueEntry?.visitUuid,
    t,
  ]);

  const handleRequeuePatient = useCallback(() => {
    requeueQueueEntry(priorityComment.REQUEUED, queueEntry?.queueUuid, queueEntry?.queueEntryUuid).then(
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
  }, [closeModal, mutateQueueEntries, queueEntry?.queueEntryUuid, queueEntry?.queueUuid, t]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('servePatient', 'Serve patient')} />
      <ModalBody className={styles.modalBody}>
        <div>
          <section className={styles.modalBody}>
            <p className={styles.p}>
              {t('patientName', 'Patient name')} : &nbsp; {queueEntry?.name}
            </p>
            {preferredIdentifiers?.length
              ? preferredIdentifiers.map((identifier) => (
                  <p className={styles.p}>
                    {identifier?.identifierType?.display} : &nbsp; {identifier?.identifier}
                  </p>
                ))
              : ''}
            <p className={styles.p}>
              {t('patientAge', 'Age')} : &nbsp; {queueEntry?.patientAge}
            </p>
            <div>
              {queueEntry.identifiers?.map((identifier) => <Tag key={identifier.uuid}>{identifier.display}</Tag>)}
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

export default TransitionQueueEntryModal;
