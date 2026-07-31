import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader, Tag } from '@carbon/react';
import { navigate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { mapVisitQueueEntryProperties, serveQueueEntry, updateQueueEntry } from '../../service-queues.resource';
import { requeueQueueEntry } from './call-queue-entry.resource';
import { getErrorMessage } from '../queue-entry-error.utils';
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

// The row-action path guards its own error reporting (`runAction` in the queue table's action cell),
// because a throw while reporting a failure — the framework's snackbar store being the broken thing,
// say — escapes a rejection handler as exactly the unhandled promise rejection the report was added
// to replace. These handlers are the other path this change touches and were not guarded, so the two
// behaved differently under the same failure.
//
// They also read `error.message` directly, which skips the wording the server itself sent in
// `responseBody` and hands a non-string straight to a snackbar subtitle, where React cannot render
// it. `getErrorMessage` does both jobs and is what every other queue entry mutation uses.
function reportFailure(title: string, error: unknown, unknownErrorMessage: string) {
  try {
    showSnackbar({
      isLowContrast: false,
      kind: 'error',
      title,
      subtitle: getErrorMessage(error) || unknownErrorMessage,
    });
  } catch (reportingError) {
    console.error('Reporting a queue entry failure in the "Serve patient" modal failed', reportingError);
  }
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

  // `mutateQueueEntries` rejects when a re-read fails, and every call to it here is made from a
  // promise handler, where a rejection nobody handles is the crash this change exists to remove.
  const refetchQueueEntries = useCallback(() => {
    void mutateQueueEntries().catch((error) => {
      console.error('Re-reading the queue entries failed', error);
    });
  }, [mutateQueueEntries]);

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
          () => {
            showSnackbar({
              isLowContrast: true,
              title: t('success', 'Success'),
              kind: 'success',
              subtitle: t('patientAttendingService', 'Patient attending service'),
            });
            closeModal();
            refetchQueueEntries();
            navigate({ to: `\${openmrsSpaBase}/patient/${mappedQueueEntry.patientUuid}/chart` });
          },
          // This is a second request, chained off the first one's success, so the rejection handler
          // below belongs to `updateQueueEntry` and does not cover it. Without a handler of its own
          // a failure here escapes as an unhandled rejection: the same full-screen crash overlay in
          // development, and the same silent no-op in production, that O3-5666 is about.
          //
          // `updateQueueEntry` has already succeeded by this point: the queue entry has ended and
          // been replaced by one carrying the transition status, and only the ticket display was
          // never told. Reporting that as "error calling patient" would tell the user nothing
          // happened when the patient has in fact moved on, and the table behind this modal keeps
          // showing the old status until something revalidates it — the queue entries have no
          // refresh interval — so say what did happen and re-read the table.
          //
          // The half-done transition itself is left alone: undoing it needs a compensating request
          // and this is not the change to add one. Pressing Serve again is not a way back into a
          // consistent state either, but it is not a way to make things worse: it would transition
          // the entry that has already ended, which the backend refuses.
          (error) => {
            reportFailure(
              t(
                'patientMovedButNotCalled',
                'The patient has been moved on in the queue, but the ticket display was not updated',
              ),
              error,
              t('unknownError', 'An unknown error occurred'),
            );
            refetchQueueEntries();
          },
        );
      },
      (error) => {
        reportFailure(
          t('queueEntryUpdateFailed', 'Error updating queue entry'),
          error,
          t('unknownError', 'An unknown error occurred'),
        );
      },
    );
  }, [
    closeModal,
    defaultTransitionStatus,
    refetchQueueEntries,
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
        refetchQueueEntries();
      },
      (error) => {
        reportFailure(
          t('queueEntryUpdateFailed', 'Error updating queue entry'),
          error,
          t('unknownError', 'An unknown error occurred'),
        );
      },
    );
  }, [closeModal, refetchQueueEntries, mappedQueueEntry.queueEntryUuid, mappedQueueEntry.queueUuid, t]);

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
                <Tag key={identifier.uuid}>{identifier.identifier}</Tag>
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
