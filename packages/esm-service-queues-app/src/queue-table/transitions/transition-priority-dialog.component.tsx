import {
  Button,
  ContentSwitcher,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Switch,
} from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type QueueEntry } from '../../types';
import styles from './transition-dialogs.scss';
import { transitionQueueEntryPriority } from './transitions.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useMutateQueueEntries';

interface TransitionPriorityDialogProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const TransitionPriorityDialog: React.FC<TransitionPriorityDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const { allowedPriorities } = queueEntry.queue;
  const [selectedQueuePriority, setSelectedQueuePriority] = useState(queueEntry.priority.uuid);
  const selectedIndex = Math.max(
    0,
    allowedPriorities.findIndex((p) => p.uuid == selectedQueuePriority),
  );

  const transitionPriority = (e) => {
    e.preventDefault();
    transitionQueueEntryPriority(queueEntry.uuid, selectedQueuePriority)
      .then(({ status }) => {
        if (status === 200) {
          showSnackbar({
            isLowContrast: true,
            title: t('priorityTransitioned', 'Priority transitioned'),
            kind: 'success',
            subtitle: t('queueEntryPriorityTransitionedSuccessfully', 'Queue entry priority transitioned successfully'),
          });
          mutateQueueEntries();
          closeModal();
        }
      })
      .catch((error) => {
        showSnackbar({
          title: t('queueEntryPriorityTransitionFailed', 'Error transitioning queue entry priority'),
          kind: 'error',
          subtitle: error?.message,
        });
      });
  };

  return (
    <div>
      <Form onSubmit={transitionPriority}>
        <ModalHeader closeModal={closeModal} title={t('transitionPriority', 'Transition priority')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <h5>{queueEntry.display}</h5>
          </div>
          <section>
            <div className={styles.sectionTitle}>{t('queuePriority', 'Queue priority')}</div>
            <ContentSwitcher
              size="sm"
              selectedIndex={selectedIndex}
              onChange={(event) => {
                setSelectedQueuePriority(event.name as string);
              }}>
              {allowedPriorities?.length > 0 ? (
                allowedPriorities.map(({ uuid, display }) => {
                  return <Switch name={uuid} text={display} key={uuid} value={uuid} />;
                })
              ) : (
                <InlineNotification
                  kind={'error'}
                  lowContrast
                  subtitle={t('configurePriorities', 'Please configure priorities to continue.')}
                  text={t('noPriorityFound', 'No priority found')}
                />
              )}
            </ContentSwitcher>
          </section>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={selectedQueuePriority == queueEntry.priority.uuid} type="submit">
            {t('transitionPriority', 'Transition priority')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default TransitionPriorityDialog;
