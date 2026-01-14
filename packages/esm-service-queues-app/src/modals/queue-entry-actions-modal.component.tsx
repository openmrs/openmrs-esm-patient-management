import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import {
  Button,
  Checkbox,
  Dropdown,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioButton,
  RadioButtonGroup,
  SelectItem,
  Stack,
  TextArea,
  TimePicker,
  TimePickerSelect,
  type OnChangeData,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { OpenmrsDatePicker, showSnackbar, type FetchResponse, useConfig } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../hooks/useQueueEntries';
import { useQueues } from '../hooks/useQueues';
import { DUPLICATE_QUEUE_ENTRY_ERROR_CODE, time12HourFormatRegexPattern } from '../constants';
import { convertTime12to24, type amPm } from './time-helpers';
import { type ConfigObject } from '../config-schema';
import { type Queue, type QueueEntry } from '../types';
import QueuePriority from '../queue-table/components/queue-priority.component';
import styles from './queue-entry-actions.scss';

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
  modifyDefaultTransitionDateTime: boolean;
  transitionDate: Date;
  transitionTime: string;
  transitionTimeFormat: amPm;
}

interface ModalParams {
  modalTitle: string;
  modalInstruction?: string;
  submitButtonText: string;
  submitSuccessTitle: string;
  submitSuccessText: string;
  submitFailureTitle: string;
  submitAction: (queueEntry: QueueEntry, formState: FormState) => Promise<FetchResponse<any>>;
  disableSubmit: (queueEntry, formState) => boolean;
  isEdit: boolean; // editing existing queue entry?
  showQueuePicker: boolean;
  showStatusPicker: boolean;
}

// This file has suffix .component.tsx and not .modal.tsx because it is not itself a modal;
// rather it is a shared component that implements the UIs of a few different modals,
// and is used by them.

/**
 * Modal for performing a queue entry action that requires additional form fields / inputs from user
 * Used by EditQueueEntryModal, MoveQueueEntryModal, and TransitionQueueEntryModal
 */
export const QueueEntryActionModal: React.FC<QueueEntryActionModalProps> = ({
  queueEntry,
  closeModal,
  modalParams,
}) => {
  const config = useConfig<ConfigObject>();
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
    isEdit,
    showQueuePicker,
    showStatusPicker,
  } = modalParams;

  const initialTransitionDate = isEdit ? new Date(queueEntry.startedAt) : new Date();
  const [formState, setFormState] = useState<FormState>({
    selectedQueue: queueEntry.queue.uuid,
    selectedPriority: queueEntry.priority.uuid,
    selectedStatus: queueEntry.status.uuid,
    prioritycomment: queueEntry.priorityComment ?? '',
    modifyDefaultTransitionDateTime: false,
    transitionDate: initialTransitionDate,
    transitionTime: dayjs(initialTransitionDate).format('hh:mm'),
    transitionTimeFormat: dayjs(initialTransitionDate).hour() < 12 ? 'AM' : 'PM',
  });
  const { queues } = useQueues();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<{
    type: 'duplicate' | 'error';
    message: string;
    title?: string;
  } | null>(null);

  const selectedQueue = queues.find((q) => q.uuid == formState.selectedQueue);

  const clearSubmissionError = () => setSubmissionError(null);

  const statuses = selectedQueue?.allowedStatuses;
  const hasNoStatusesConfigured = selectedQueue && statuses.length == 0;
  const priorities = selectedQueue?.allowedPriorities;
  const hasNoPrioritiesConfigured = selectedQueue && priorities.length == 0;

  const setSelectedQueueUuid = (selectedQueueUuid: string) => {
    clearSubmissionError();
    const newSelectedQueue = queues.find((q) => q.uuid == selectedQueueUuid);
    const { allowedStatuses, allowedPriorities } = newSelectedQueue;
    const newQueueHasCurrentPriority = allowedPriorities.find((s) => s.uuid == formState.selectedPriority);
    const defaultStatusUuid = config.concepts.defaultStatusConceptUuid;
    const newQueueHasDefaultStatus = allowedStatuses.find((s) => s.uuid == defaultStatusUuid);
    const newStatus = newQueueHasDefaultStatus ? defaultStatusUuid : allowedStatuses[0]?.uuid;

    setFormState({
      ...formState,
      selectedQueue: selectedQueueUuid,
      selectedStatus: newStatus,
      selectedPriority: newQueueHasCurrentPriority ? formState.selectedPriority : allowedPriorities[0]?.uuid,
    });
  };

  const setSelectedPriorityUuid = (selectedPriorityUuid: string) => {
    clearSubmissionError();
    setFormState({ ...formState, selectedPriority: selectedPriorityUuid });
  };

  const setSelectedStatusUuid = (selectedStatusUuid: string) => {
    clearSubmissionError();
    setFormState({ ...formState, selectedStatus: selectedStatusUuid });
  };

  const setPriorityComment = (prioritycomment: string) => {
    setFormState({ ...formState, prioritycomment });
  };

  const setTransitionDate = (transitionDate: Date) => {
    setFormState({ ...formState, transitionDate });
  };

  const setTransitionTime = (transitionTime: string) => {
    setFormState({ ...formState, transitionTime });
  };

  const setTransitionTimeFormat = (transitionTimeFormat: amPm) => {
    setFormState({ ...formState, transitionTimeFormat });
  };

  const setModifyDefaultTransitionDateTime = (modifyDefaultTransitionDateTime) => {
    setFormState({ ...formState, modifyDefaultTransitionDateTime });
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
        const errorMessage = error?.responseBody?.error?.message || error?.message || '';
        const isDuplicateQueueEntryError = errorMessage.includes(DUPLICATE_QUEUE_ENTRY_ERROR_CODE);

        if (isDuplicateQueueEntryError) {
          setSubmissionError({
            type: 'duplicate',
            message: t('duplicateQueueEntry', 'This patient is already in the selected queue.'),
            title: t('patientAlreadyInQueue', 'Patient already in queue'),
          });
        } else {
          setSubmissionError({
            type: 'error',
            message: error?.message || t('unknownError', 'An unknown error occurred'),
            title: submitFailureTitle,
          });
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // non-null if the selected date+time is invalid
  const timeInvalidMessage = useMemo(() => {
    const now = new Date();
    const startAtDate = new Date(formState.transitionDate);
    const [hour, minute] = convertTime12to24(formState.transitionTime, formState.transitionTimeFormat);
    startAtDate.setHours(hour, minute, 0, 0);

    const previousQueueEntryStartTimeStr = queueEntry.previousQueueEntry?.startedAt;
    const previousQueueEntryStartTime = previousQueueEntryStartTimeStr
      ? new Date(previousQueueEntryStartTimeStr)
      : null;

    if (startAtDate > now) {
      return t('timeCannotBeInFuture', 'Time cannot be in the future');
    }
    if (startAtDate <= previousQueueEntryStartTime) {
      return t(
        'timeCannotBePriorToPreviousQueueEntry',
        'Time cannot be before start of previous queue entry: {{time}}',
        {
          time: previousQueueEntryStartTime.toLocaleString(),
          interpolation: { escapeValue: false },
        },
      );
    }
    return null;
  }, [
    formState.transitionDate,
    formState.transitionTime,
    formState.transitionTimeFormat,
    queueEntry.previousQueueEntry?.startedAt,
    t,
  ]);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={modalTitle} />
      <ModalBody>
        <div className={styles.queueEntryActionModalBody}>
          <Stack gap={4}>
            <p>{modalInstruction}</p>
            {showQueuePicker && (
              <section>
                <div className={styles.sectionTitlePrimary}>{t('serviceLocation', 'Service location')}</div>
                {/* Read this issue description for why we're using 8 locations as the cut off https://openmrs.atlassian.net/jira/software/c/projects/O3/issues/O3-4131 */}
                {queues.length <= 8 ? (
                  <RadioButtonGroup
                    className={styles.radioButtonGroup}
                    id="queue"
                    name="queue"
                    invalidText="Required"
                    valueSelected={formState.selectedQueue}
                    orientation="vertical"
                    onChange={(uuid) => setSelectedQueueUuid(String(uuid))}>
                    {queues?.map(({ uuid, display, location }) => (
                      <RadioButton
                        key={uuid}
                        labelText={
                          uuid === queueEntry.queue.uuid
                            ? t('currentValueFormatted', '{{value}} (Current)', {
                                value: `${display} - ${location?.display}`,
                              })
                            : `${display} - ${location?.display}`
                        }
                        value={uuid}
                      />
                    ))}
                  </RadioButtonGroup>
                ) : (
                  <Dropdown<Queue>
                    id="queue"
                    label={selectedQueue.display}
                    initialSelectedItem={selectedQueue}
                    items={queues}
                    itemToString={(item: Queue) =>
                      item.uuid === queueEntry.queue.uuid
                        ? t('currentValueFormatted', '{{value}} (Current)', {
                            value: `${item.display} - ${item.location?.display}`,
                          })
                        : `${item.display} - ${item.location?.display}`
                    }
                    onChange={(data: OnChangeData<Queue>) => {
                      const queue = data.selectedItem;
                      if (queue) {
                        setSelectedQueueUuid(queue.uuid);
                      }
                    }}
                    titleText=""
                  />
                )}
              </section>
            )}

            {showStatusPicker && (
              <section>
                <div className={classNames(showQueuePicker ? styles.sectionTitle : styles.sectionTitlePrimary)}>
                  {t('status', 'Status')}
                </div>
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
                      setSelectedStatusUuid(String(uuid));
                    }}>
                    {statuses?.map(({ uuid, display }) => (
                      <RadioButton
                        key={uuid}
                        name={display}
                        labelText={
                          uuid == queueEntry.status.uuid
                            ? t('currentValueFormatted', '{{value}} (Current)', {
                                value: display,
                              })
                            : display
                        }
                        value={uuid}
                      />
                    ))}
                  </RadioButtonGroup>
                )}
              </section>
            )}

            <section>
              <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
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
                  name="priority"
                  valueSelected={formState.selectedPriority}
                  onChange={(uuid) => {
                    setSelectedPriorityUuid(String(uuid));
                  }}>
                  {priorities?.map(({ uuid, display }) => (
                    <RadioButton
                      key={uuid}
                      name={display}
                      labelText={
                        <QueuePriority priority={{ uuid, display }} priorityConfigs={config.priorityConfigs} />
                      }
                      value={uuid}
                    />
                  ))}
                </RadioButtonGroup>
              )}
            </section>

            <section>
              <div className={styles.sectionTitle}>{t('comment', 'Comment')}</div>
              <TextArea
                labelText=""
                value={formState.prioritycomment}
                onChange={(e) => setPriorityComment(e.target.value)}
                placeholder={t('enterCommentHere', 'Enter comment here')}
              />
            </section>

            <section>
              <div className={styles.sectionTitle}>{t('timeOfTransition', 'Time of transition')}</div>
              <Checkbox
                labelText={t('now', 'Now')}
                id={'modifyTransitionTime'}
                checked={!formState.modifyDefaultTransitionDateTime}
                onChange={(_, { checked }) => {
                  setModifyDefaultTransitionDateTime(!checked);
                }}
              />
              {formState.modifyDefaultTransitionDateTime && (
                <div className={styles.dateTimeFields}>
                  <OpenmrsDatePicker
                    data-testid="datePickerInput"
                    id="datePickerInput"
                    labelText={t('date', 'Date')}
                    maxDate={new Date()}
                    onChange={setTransitionDate}
                    value={formState.transitionDate}
                  />

                  <TimePicker
                    id="transitionTime"
                    labelText={t('time', 'Time')}
                    onChange={(event) => setTransitionTime(event.target.value)}
                    pattern={time12HourFormatRegexPattern}
                    value={formState.transitionTime}
                    invalid={timeInvalidMessage != null}
                    invalidText={timeInvalidMessage}>
                    <TimePickerSelect
                      id="visitStartTimeSelect"
                      onChange={(event) => setTransitionTimeFormat(event.target.value as amPm)}
                      value={formState.transitionTimeFormat}
                      aria-label={t('time', 'Time')}>
                      <SelectItem value="AM" text="AM" />
                      <SelectItem value="PM" text="PM" />
                    </TimePickerSelect>
                  </TimePicker>
                </div>
              )}
            </section>

            {submissionError && (
              <InlineNotification
                kind="error"
                lowContrast={false}
                title={submissionError.title || t('queueEntryError', 'Error updating queue entry')}
                subtitle={submissionError.message}
                onClose={() => setSubmissionError(null)}
              />
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
