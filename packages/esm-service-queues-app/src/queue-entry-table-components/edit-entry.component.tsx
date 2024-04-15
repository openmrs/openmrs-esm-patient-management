import React, { useCallback } from 'react';
import { type MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import styles from './edit-entry.scss';

interface EditMenuProps {
  queueEntry: MappedVisitQueueEntry;
}
const EditMenu: React.FC<EditMenuProps> = ({ queueEntry }) => {
  const { t } = useTranslation();
  const launchEditPriorityModal = useCallback(() => {
    const dispose = showModal('edit-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button onClick={launchEditPriorityModal} className={styles.editIcon} kind="ghost">
      {t('transfer', 'Transfer')}
    </Button>
  );
};

export default EditMenu;
