import React, { useCallback } from 'react';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import type { Queue } from '../../types';
import styles from './admin-page.scss';

interface QueueActionMenuProps {
  queue: Queue;
}

const QueueActionMenu: React.FC<QueueActionMenuProps> = ({ queue }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const handleEditQueue = useCallback(() => {
    launchWorkspace2('service-queues-service-form', { queue });
  }, [queue]);

  const handleDeleteQueue = useCallback(() => {
    const dispose = showModal('delete-queue-modal', {
      queue,
      closeModal: () => dispose(),
    });
  }, [queue]);

  return (
    <Layer>
      <OverflowMenu aria-label={t('actions', 'Actions')} size={isTablet ? 'lg' : 'sm'} flipped align="left">
        <OverflowMenuItem className={styles.menuitem} itemText={t('edit', 'Edit')} onClick={handleEditQueue} />
        <OverflowMenuItem
          className={styles.menuitem}
          isDelete
          itemText={t('delete', 'Delete')}
          onClick={handleDeleteQueue}
        />
      </OverflowMenu>
    </Layer>
  );
};

export default QueueActionMenu;
