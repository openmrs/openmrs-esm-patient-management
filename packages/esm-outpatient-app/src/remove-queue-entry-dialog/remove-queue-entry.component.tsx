import React from 'react';
import { useTranslation } from 'react-i18next';
import { MappedQueueEntry } from '../types';
import styles from './remove-queue-entry.scss';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import {
  parseDate,
  showNotification,
  showToast,
  toDateObjectStrict,
  toOmrsIsoString,
  updateVisit,
  useVisit,
} from '@openmrs/esm-framework';
import { voidQueueEntry } from './remove-queue-entry.resource';
import { first } from 'rxjs/operators';
import { useSWRConfig } from 'swr';

interface RemoveQueueEntryDialogProps {
  queueEntry: MappedQueueEntry;
  closeModal: () => void;
}

const RemoveQueueEntryDialog: React.FC<RemoveQueueEntryDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(queueEntry.patientUuid);
  const { mutate } = useSWRConfig();

  const removeQueueEntry = () => {
    const endCurrentVisitPayload = {
      location: currentVisit?.location.uuid,
      startDatetime: parseDate(currentVisit?.startDatetime),
      visitType: currentVisit?.visitType?.uuid,
      stopDatetime: new Date(),
    };

    const abortController = new AbortController();
    const endedAt = toDateObjectStrict(toOmrsIsoString(new Date()));

    voidQueueEntry(queueEntry.queueUuid, abortController, queueEntry.queueEntryUuid, endedAt).then(({ status }) => {
      if (status === 200) {
        if (currentVisit) {
          updateVisit(currentVisit.uuid, endCurrentVisitPayload, abortController)
            .pipe(first())
            .subscribe(
              (response) => {
                if (response.status === 200) {
                  closeModal();
                  mutate(`/ws/rest/v1/visit-queue-entry?v=full`);

                  showToast({
                    critical: true,
                    kind: 'success',
                    description: t(
                      'queueEntryRemovedAndVisitEndedSuccessfully',
                      `Queue entry removed and ${response?.data?.visitType?.display} ended successfully`,
                    ),
                    title: t('queueEntryRemoved', 'Queue entry removed'),
                  });
                }
              },
              (error) => {
                showNotification({
                  title: t('endVisitError', 'Error ending active visit'),
                  kind: 'error',
                  critical: true,
                  description: error?.message,
                });
              },
            );
        } else {
          closeModal();
          mutate(`/ws/rest/v1/visit-queue-entry?v=full`);
          showToast({
            critical: true,
            kind: 'success',
            description: t('queueEntryRemovedSuccessfully', `Queue entry removed successfully`),
            title: t('queueEntryRemoved', 'Queue entry removed'),
          });
        }
      }
      (error) => {
        showNotification({
          title: t('removeQueueEntryError', 'Error removing queue entry'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      };
    });
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        label={t('visit', 'Visit')}
        title={t('removeFromQueueAndEndVisit', 'Remove patient from queue and end active visit')}
      />
      <ModalBody>
        <p className={styles.bodyShort02}>
          {t(
            'endVisitWarningMessage',
            'Ending this visit will not allow you to fill another encounter form for this patient',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" onClick={removeQueueEntry}>
          {t('endVisit', 'End Visit')}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default RemoveQueueEntryDialog;
