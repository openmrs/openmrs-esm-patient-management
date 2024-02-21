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
  Switch,
} from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../../hooks/useQueues';
import { type QueueEntry } from '../../types';
import styles from './transition-dialogs.scss';
import { transferQueueEntry } from './transitions.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useMutateQueueEntries';

interface ChangeStatusDialogProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

interface FormState {
  selectedQueue: string;
  selectedPriority: string;
  selectedStatus: string;
}

const TransferQueueDialog: React.FC<ChangeStatusDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const [formState, setFormState] = useState<FormState>({
    selectedQueue: queueEntry.queue.uuid,
    selectedPriority: queueEntry.priority.uuid,
    selectedStatus: queueEntry.status.uuid,
  });

  const { queues } = useQueues();

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

  const transferQueue = (e) => {
    e.preventDefault();

    transferQueueEntry(queueEntry.uuid, formState.selectedQueue, formState.selectedStatus, formState.selectedPriority)
      .then(({ status }) => {
        if (status === 200) {
          showSnackbar({
            isLowContrast: true,
            title: t('queueEntryTransferred', 'Queue entry transferred'),
            kind: 'success',
            subtitle: t('queueEntryTransferredSuccessfully', 'Queue entry transferred successfully'),
          });
          mutateQueueEntries();
          closeModal();
        } else {
          throw { message: t('unexpectedServerResponse', 'Unexpected Server Response') };
        }
      })
      .catch((error) => {
        showSnackbar({
          title: t('queueEntryTranferFailed', 'Error transferring queue entry'),
          kind: 'error',
          subtitle: error?.message,
        });
      });
  };

  return (
    <div>
      <Form onSubmit={transferQueue}>
        <ModalHeader closeModal={closeModal} title={t('transferToNextQueue', 'Transfer to next queue')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <h5>{queueEntry.display}</h5>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('serviceQueue', 'Service queue')}</div>
            <Select
              labelText={t('selectQueue', 'Select a queue')}
              id="queue"
              invalidText="Required"
              value={formState.selectedQueue}
              onChange={(event) => setSelectedQueueUuid(event.target.value)}>
              {queues?.map((queue) => (
                <SelectItem key={queue.uuid} text={queue.display} value={queue.uuid}>
                  {queue.display}
                </SelectItem>
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
                defaultSelected={formState.selectedStatus}
                onChange={(uuid) => {
                  setSelectedStatusUuid(uuid);
                }}>
                {statuses?.map(({ uuid, display }) => (
                  <RadioButton key={uuid} name={display} labelText={display} value={uuid} />
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
                selectedIndex={1}
                onChange={(event) => {
                  setSelectedPriorityUuid(event.name as string);
                }}>
                {priorities?.map(({ uuid, display }) => {
                  return <Switch role="radio" name={uuid} text={display} key={uuid} value={uuid} />;
                })}
              </ContentSwitcher>
            )}
          </section>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={formState.selectedQueue == queueEntry.queue.uuid} type="submit">
            {t('transferToNextQueue', 'Transfer to next queue')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default TransferQueueDialog;
