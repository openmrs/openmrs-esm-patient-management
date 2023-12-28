import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { mutate } from 'swr';
import { Button } from '@carbon/react';
import { Notification } from '@carbon/react/icons';
import { showModal, showNotification } from '@openmrs/esm-framework';
import { type MappedVisitQueueEntry, serveQueueEntry } from '../active-visits/active-visits-table.resource';
import styles from './transition-entry.scss';
interface TransitionMenuProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}
const TransitionMenu: React.FC<TransitionMenuProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const launchTransitionPriorityModal = useCallback(() => {
    serveQueueEntry(queueEntry?.service, queueEntry?.visitQueueNumber, 'calling').then(
      ({ status }) => {
        if (status === 200) {
          mutate(`/ws/rest/v1/queueutil/assignticket`);
        }
      },
      (error) => {
        showNotification({
          title: t('errorPostingToScreen', 'Error posting to screen'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
    const dispose = showModal('transition-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button
      renderIcon={(props) => <Notification size={16} {...props} />}
      className={classNames(styles.callBtn, {
        [styles.requeueIcon]: queueEntry?.priorityComment === 'Requeued',
        [styles.normalIcon]: queueEntry?.priorityComment !== 'Requeued',
      })}
      onClick={launchTransitionPriorityModal}
      iconDescription={t('call', 'Call')}
      hasIconOnly
      tooltipAlignment="end"
      tooltipPosition="bottom"
    />
  );
};

export default TransitionMenu;
