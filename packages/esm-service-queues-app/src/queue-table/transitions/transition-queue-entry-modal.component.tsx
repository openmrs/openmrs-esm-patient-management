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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useQueues';
import { type QueueEntry } from '../../types';
import styles from './transition-dialogs.scss';
import { showSnackbar } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useMutateQueueEntries';
import { transitionQueueEntry } from './transitions.resource';

interface TransitionQueueEntryModalProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

interface FormState {
  selectedQueue: string;
  selectedPriority: string;
  selectedStatus: string;
}

const TransitionQueueEntryModal: React.FC<TransitionQueueEntryModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const [formState, setFormState] = useState<FormState>({
    selectedQueue: queueEntry.queue.uuid,
    selectedPriority: queueEntry.priority.uuid,
    selectedStatus: queueEntry.status.uuid,
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
    });
  };

  const setSelectedPriorityUuid = (selectedPriorityUuid: string) => {
    setFormState({ ...formState, selectedPriority: selectedPriorityUuid });
  };

  const setSelectedStatusUuid = (selectedStatusUuid: string) => {
    setFormState({ ...formState, selectedStatus: selectedStatusUuid });
  };

  const submitForm = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    transitionQueueEntry({
      queueEntryToTransition: queueEntry.uuid,
      newQueue: formState.selectedQueue,
      newStatus: formState.selectedStatus,
      newPriority: formState.selectedPriority,
    })
      .then(({ status }) => {
        if (status === 200) {
          showSnackbar({
            isLowContrast: true,
            title: t('queueEntryTransitioned', 'Queue entry transitioned'),
            kind: 'success',
            subtitle: t('queueEntryTransitionedSuccessfully', 'Queue entry transitioned successfully'),
          });
          mutateQueueEntries();
          closeModal();
        } else {
          throw { message: t('unexpectedServerResponse', 'Unexpected Server Response') };
        }
      })
      .catch((error) => {
        showSnackbar({
          title: t('queueEntryTransitionFailed', 'Error transitioning queue entry'),
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
    <div>
      <Form onSubmit={submitForm}>
        <ModalHeader closeModal={closeModal} title={t('transitionPatient', 'Transition patient')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <Stack gap={4}>
              <h5>{queueEntry.display}</h5>
              <p>{t('transitionPatientStatusOrQueue', 'Select a new status or queue for patient to transition to.')}</p>
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
                          ? t('currentValueFormatted', '{{value}} (Current value)', { value: display })
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
                            ? t('currentValueFormatted', '{{value}} (Current value)', { value: display })
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
                            ? t('currentValueFormatted', '{{value}} (Current value)', { value: display })
                            : display
                        }
                        key={uuid}
                        value={uuid}
                      />
                    ))}
                  </ContentSwitcher>
                )}
              </section>
            </Stack>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={
              isSubmitting ||
              (formState.selectedQueue == queueEntry.queue.uuid && formState.selectedStatus == queueEntry.status.uuid)
            }
            type="submit">
            {t('transitionPatient', 'Transition patient')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default TransitionQueueEntryModal;
