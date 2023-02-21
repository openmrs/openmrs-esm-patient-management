import React, { useCallback } from 'react';
import { Notification } from '@carbon/react/icons';
import { MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import styles from './transition-entry.scss';
interface TransitionMenuProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}
const TransitionMenu: React.FC<TransitionMenuProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const launchTransitionPriorityModal = useCallback(() => {
    const dispose = showModal('transition-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button
      renderIcon={(props) => <Notification size={16} {...props} />}
      className={`${styles.callBtn} ${
        queueEntry?.priorityComment === 'Requeued' ? styles.requeueIcon : styles.normalIcon
      }`}
      onClick={launchTransitionPriorityModal}
      iconDescription={t('call', 'Call')}
      hasIconOnly
      tooltipAlignment="end"
      tooltipPosition="bottom"
    />
  );
};

export default TransitionMenu;
