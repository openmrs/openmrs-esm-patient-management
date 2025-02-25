import React, { useState } from 'react';
import {
  Button,
  Dropdown,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioButton,
  RadioButtonGroup,
  Stack,
  Tag,
  TextArea,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, type FetchResponse } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { useQueues } from '../../hooks/useQueues';
import { type QueueEntry } from '../../types';
import styles from './queue-entry-actions-modal.scss';

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
  isTransition: boolean; // is transition or edit?
}

// Modal for performing a queue entry action that requires additional form fields / inputs from user
// Used by EditQueueEntryModal and TransitionQueueEntryModal
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
    isTransition,
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
      ...formState,
      selectedQueue: selectedQueueUuid,
      selectedStatus: newQueueHasCurrentStatus ? formState.selectedStatus : allowedStatuses[0]?.uuid,
      selectedPriority: newQueueHasCurrentPriority ? formState.selectedPriority : allowedPriorities[0]?.uuid,
    });
  };

  const setSelectedPriorityUuid = (selectedPriorityUuid: string) => {
    setFormState({ ...formState, selectedPriority: selectedPriorityUuid });
  };

  const setSelectedStatusUuid = (selectedStatusUuid: string) => {
    setFormState({ ...formState, selectedStatus: selectedStatusUuid });
  };

  const setPriorityComment = (prioritycomment: string) => {
    setFormState((prevState) => ({ ...prevState, prioritycomment }));
  };

  const submitForm = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedState = { ...formState };

    if (updatedState.selectedPriority === priorities[0]?.uuid) {
      updatedState.prioritycomment = '';
    }

    setFormState(updatedState);

    submitAction(queueEntry, updatedState)
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

  const selectedPriorityIndex = priorities?.findIndex((p) => p.uuid == formState.selectedPriority);

  return (
    <>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        <div className={styles.queueEntryActionModalBody}>
          <Stack gap={4}>
            {isTransition ? (
              <p>{modalInstruction}</p>
            ) : (
              <>
                <h5>{queueEntry.display}</h5>
                <p>{modalInstruction}</p>
              </>
            )}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>{t('serviceQueue', 'Service queue')}</div>
              {queues.length <= 8 ? (
                <RadioButtonGroup
                  className={styles.radioButtonGroup}
                  legendText={t('selectQueue', 'Select a queue')}
                  id="queue"
                  invalidText="Required"
                  valueSelected={formState.selectedQueue}
                  orientation="vertical"
                  onChange={(uuid) => setSelectedQueueUuid(uuid)}>
                  {queues?.map(({ uuid, display, location }) => (
                    <RadioButton
                      key={uuid}
                      labelText={
                        uuid == queueEntry.queue.uuid
                          ? t('currentValueFormatted', '{{value}} (Current)', {
                              value: `${display} - ${location?.display}`,
                              interpolation: { escapeValue: false },
                            })
                          : `${display} - ${location?.display}`
                      }
                      value={uuid}
                    />
                  ))}
                </RadioButtonGroup>
              ) : (
                <Dropdown
                  titleText={t('selectQueue', 'Select a queue')}
                  id="queue"
                  label={selectedQueue.display}
                  initialSelectedItem={selectedQueue}
                  value={formState.selectedQueue}
                  items={queues}
                  itemToString={(item) =>
                    item.uuid == queueEntry.queue.uuid
                      ? t('currentValueFormatted', '{{value}} (Current)', {
                          value: `${item.display} - ${item.location?.display}`,
                          interpolation: { escapeValue: false },
                        })
                      : `${item.display} - ${item.location?.display}`
                  }
                  onChange={({ selectedItem }) => setSelectedQueueUuid(selectedItem.uuid)}
                />
              )}
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
                <RadioButtonGroup
                  className={styles.radioButtonGroup}
                  valueSelected={formState.selectedPriority}
                  onChange={(uuid) => {
                    setSelectedPriorityUuid(uuid);
                  }}>
                  {priorities?.map(({ uuid, display }) => (
                    <RadioButton
                      key={uuid}
                      name={display}
                      labelText={
                        <Tag
                          className={`${priorities.findIndex((p) => p.uuid === uuid) === 1 && styles.orange} ${
                            styles.tag
                          }`}
                          role="radio"
                          key={uuid}
                          value={uuid}
                          type={(() => {
                            const index = priorities.findIndex((p) => p.uuid === uuid);
                            return index === 0 ? 'green' : index === 2 ? 'red' : '';
                          })()}>
                          {uuid == queueEntry.priority.uuid
                            ? t('currentValueFormatted', '{{value}} (Current)', {
                                value: display,
                                interpolation: { escapeValue: false },
                              })
                            : display}
                        </Tag>
                      }
                      value={uuid}
                    />
                  ))}
                </RadioButtonGroup>
              )}
            </section>
            {selectedPriorityIndex > 0 && (
              <section className={styles.section}>
                <div className={styles.sectionTitle}>{t('priorityComment', 'Priority comment')}</div>
                <TextArea
                  labelText=""
                  value={formState.prioritycomment}
                  onChange={(e) => setPriorityComment(e.target.value)}
                  placeholder={t('enterCommentHere', 'Enter comment here')}
                />
              </section>
            )}
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
