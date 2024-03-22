import {
  Button,
  ContentSwitcher,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  Switch,
} from '@carbon/react';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutateQueueEntries } from '../../hooks/useMutateQueueEntries';
import { useQueues } from '../../hooks/useQueues';
import { type QueueEntry } from '../../types';
import styles from './queue-entry-actons-modal.scss';
import { TextArea } from '@carbon/react';

interface QueueEntryActionModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
  modalParams: ModalParams;
}

interface FormState {
  selectedQueue: string;
  selectedPriority: string;
  selectedStatus: string;
  prioritycomment: string;
}

interface ModalParams {
  modalTitle: string;
  modalInstruction: string;
  submitButtonText: string;
  submitSuccessTitle: string;
  submitSuccessText: string;
  submitFailureTitle: string;
  submitAction: (queueEntry: QueueEntry, formState: FormState) => Promise<FetchResponse<any>>;
  disableSubmit: (queueEntry, formState) => boolean;
}

// Modal with a form to provide the same UI for editing or transitioning a queue entry
export const QueueEntryActionModal: React.FC<QueueEntryActionModalProps> = ({
  queueEntry,
  closeModal,
  modalParams,
}) => {
  const { t } = useTranslation();
  const { mutateQueueEntries } = useMutateQueueEntries();
  const {
    modalTitle,
    modalInstruction,
    submitButtonText,
    submitSuccessTitle,
    submitSuccessText,
    submitFailureTitle,
    submitAction,
    disableSubmit,
  } = modalParams;

  const [formState, setFormState] = useState<FormState>({
    selectedQueue: queueEntry.queue.uuid,
    selectedPriority: queueEntry.priority.uuid,
    selectedStatus: queueEntry.status.uuid,
    prioritycomment: queueEntry.priorityComment ?? '',
  });
  const { queues } = useQueues();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedQueue = queues.find((q) => q.uuid == formState.selectedQueue);

  const statuses = selectedQueue?.allowedStatuses;
  const hasNoStatusesConfigured = selectedQueue && statuses.length == 0;
  const priorities = selectedQueue?.allowedPriorities;
  const hasNoPrioritiesConfigured = selectedQueue && priorities.length == 0;

  const setSelectedQueueUuid = (selectedQueueUuid: string) => {
    const newSelectedQueue = queues.find((q) => q.uuid == selectedQueueUuid);
    const { allowedStatuses, allowedPriorities } = newSelectedQueue;
    const newQueueHasCurrentStatus = allowedStatuses.find((s) => s.uuid == formState.selectedStatus);
    const newQueueHasCurrentPriority = allowedPriorities.find((s) => s.uuid == formState.selectedPriority);
    setFormState({
      selectedQueue: selectedQueueUuid,
      selectedStatus: newQueueHasCurrentStatus ? formState.selectedStatus : allowedStatuses[0]?.uuid,
      selectedPriority: newQueueHasCurrentPriority ? formState.selectedPriority : allowedPriorities[0]?.uuid,
      prioritycomment: formState.prioritycomment,
    });
  };

  const setSelectedPriorityUuid = (selectedPriorityUuid: string) => {
    setFormState({ ...formState, selectedPriority: selectedPriorityUuid });
  };

  const setSelectedStatusUuid = (selectedStatusUuid: string) => {
    setFormState({ ...formState, selectedStatus: selectedStatusUuid });
  };

  const setPriorityComment = (prioritycomment: string) => {
    setFormState({ ...formState, prioritycomment });
  };

  const submitForm = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    submitAction(queueEntry, formState)
      .then(({ status }) => {
        if (status === 200) {
          showSnackbar({
            isLowContrast: true,
            title: submitSuccessTitle,
            kind: 'success',
            subtitle: submitSuccessText,
          });
          mutateQueueEntries();
          closeModal();
        } else {
          throw { message: t('unexpectedServerResponse', 'Unexpected Server Response') };
        }
      })
      .catch((error) => {
        showSnackbar({
          title: submitFailureTitle,
          kind: 'error',
          subtitle: error?.message,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const selectedPriorityIndex = priorities.findIndex((p) => p.uuid == formState.selectedPriority);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        <div className={styles.queueEntryActionModalBody}>
          <Stack gap={4}>
            <h5>{queueEntry.display}</h5>
            <p>{modalInstruction}</p>
            <section className={styles.section}>
              <div className={styles.sectionTitle}>{t('serviceQueue', 'Service queue')}</div>
              <Select
                labelText={t('selectQueue', 'Select a queue')}
                id="queue"
                invalidText="Required"
                value={formState.selectedQueue}
                onChange={(event) => setSelectedQueueUuid(event.target.value)}>
                {queues?.map(({ uuid, display }) => (
                  <SelectItem
                    key={uuid}
                    text={
                      uuid == queueEntry.queue.uuid
                        ? t('currentValueFormatted', '{{value}} (Current)', {
                            value: display,
                            interpolation: { escapeValue: false },
                          })
                        : display
                    }
                    value={uuid}
                  />
                ))}
              </Select>
            </section>

            <section>
              <div className={styles.sectionTitle}>{t('queueStatus', 'Queue status')}</div>
              {hasNoStatusesConfigured ? (
                <InlineNotification
                  kind={'error'}
                  lowContrast
                  subtitle={t('configureStatus', 'Please configure status to continue.')}
                  title={t('noStatusConfigured', 'No status configured')}
                />
              ) : (
                <RadioButtonGroup
                  name="status"
                  valueSelected={formState.selectedStatus}
                  onChange={(uuid) => {
                    setSelectedStatusUuid(uuid);
                  }}>
                  {statuses?.map(({ uuid, display }) => (
                    <RadioButton
                      key={uuid}
                      name={display}
                      labelText={
                        uuid == queueEntry.status.uuid
                          ? t('currentValueFormatted', '{{value}} (Current)', {
                              value: display,
                              interpolation: { escapeValue: false },
                            })
                          : display
                      }
                      value={uuid}
                    />
                  ))}
                </RadioButtonGroup>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>{t('queuePriority', 'Queue priority')}</div>
              {hasNoPrioritiesConfigured ? (
                <InlineNotification
                  className={styles.inlineNotification}
                  kind={'error'}
                  lowContrast
                  subtitle={t('configurePriorities', 'Please configure priorities to continue.')}
                  title={t('noPrioritiesConfigured', 'No priorities configured')}
                />
              ) : (
                <ContentSwitcher
                  size="sm"
                  selectedIndex={selectedPriorityIndex}
                  onChange={(event) => {
                    setSelectedPriorityUuid(event.name as string);
                  }}>
                  {priorities?.map(({ uuid, display }) => (
                    <Switch
                      role="radio"
                      name={uuid}
                      text={
                        uuid == queueEntry.priority.uuid
                          ? t('currentValueFormatted', '{{value}} (Current)', {
                              value: display,
                              interpolation: { escapeValue: false },
                            })
                          : display
                      }
                      key={uuid}
                      value={uuid}
                    />
                  ))}
                </ContentSwitcher>
              )}
            </section>
            <section className={styles.section}>
              <div className={styles.sectionTitle}>{t('priorityComment', 'Priority comment')}</div>
              <TextArea
                value={formState.prioritycomment}
                onChange={(e) => setPriorityComment(e.target.value)}
                placeholder={t('enterCommentHere', 'Enter comment here')}
              />
            </section>
          </Stack>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={isSubmitting || disableSubmit(queueEntry, formState)} onClick={submitForm}>
          {submitButtonText}
        </Button>
      </ModalFooter>
    </>
  );
};

export default QueueEntryActionModal;
