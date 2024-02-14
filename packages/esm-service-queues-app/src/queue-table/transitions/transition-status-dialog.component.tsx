import {
  Button,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioButton,
  RadioButtonGroup,
} from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './transition-dialogs.scss';
import { type QueueEntry } from '../../types';
import { transitionQueueEntryStatus } from './transitions.resource';
import { showSnackbar } from '@openmrs/esm-framework';
import { useMutateQueueEntries } from '../../hooks/useMutateQueueEntries';

interface TransitionStatusDialogProps {
  queueEntry: QueueEntry;
  closeModal: () => void;
}

const TransitionStatusDialog: React.FC<TransitionStatusDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const { allowedStatuses } = queueEntry.queue;
  const [selectedQueueStatus, setSelectedQueueStatus] = useState(queueEntry.status.uuid);

  const transitionStatus = (e) => {
    e.preventDefault();
    transitionQueueEntryStatus(queueEntry.uuid, selectedQueueStatus)
      .then(({ status }) => {
        if (status === 200) {
          showSnackbar({
            isLowContrast: true,
            title: t('statusTransitioned', 'Status transitioned'),
            kind: 'success',
            subtitle: t('queueEntryStatusTransitionedSuccessfully', 'Queue entry status transitioned successfully'),
          });
          mutateQueueEntries();
          closeModal();
        } else {
          throw { message: t('unexpectedServerResponse', 'Unexpected Server Response') };
        }
      })
      .catch((error) => {
        showSnackbar({
          title: t('queueEntryStatusTransitionFailed', 'Error transitioning queue entry status'),
          kind: 'error',
          subtitle: error?.message,
        });
      });
  };

  return (
    <div>
      <Form onSubmit={transitionStatus}>
        <ModalHeader closeModal={closeModal} title={t('transitionStatus', 'Transition status')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <h5>{queueEntry.display}</h5>
          </div>

          <section>
            <div className={styles.sectionTitle}>{t('queueStatus', 'Queue status')}</div>
            {!allowedStatuses?.length ? (
              <InlineNotification
                kind={'error'}
                lowContrast
                title={t('noStatusConfigured', 'No status configured')}
                subtitle={t('configureStatus', 'Please configure status to continue.')}
              />
            ) : (
              <RadioButtonGroup
                name="status"
                defaultSelected={selectedQueueStatus}
                onChange={(uuid) => {
                  setSelectedQueueStatus(uuid);
                }}>
                {allowedStatuses.map(({ uuid, display }) => (
                  <RadioButton key={uuid} labelText={display} value={uuid} />
                ))}
              </RadioButtonGroup>
            )}
          </section>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={selectedQueueStatus == queueEntry.status.uuid}>
            {t('transitionStatus', 'Transition status')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default TransitionStatusDialog;
