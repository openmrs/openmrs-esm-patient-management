import React, { useCallback } from 'react';
import { Notification } from '@carbon/react/icons';
import { MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import { ConfigObject, showModal, useConfig } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';

interface TransitionMenuProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}
const TransitionMenu: React.FC<TransitionMenuProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const config = useConfig() as ConfigObject;
  const defaultTransitionStatus = config.concepts.defaultTransitionStatus;

  const launchTransitionPriorityModal = useCallback(() => {
    const dispose = showModal('transition-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button
      kind={`${queueEntry?.statusUuid === defaultTransitionStatus ? 'danger--ghost' : 'ghost'}`}
      onClick={launchTransitionPriorityModal}
      iconDescription={t('call', 'Call')}
      hasIconOnly>
      <Notification size={16} />
    </Button>
  );
};

export default TransitionMenu;
