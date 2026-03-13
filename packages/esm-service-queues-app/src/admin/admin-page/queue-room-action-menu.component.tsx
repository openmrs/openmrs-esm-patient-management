import React, { useCallback } from 'react';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import type { QueueRoom } from '../../types';
import styles from './admin-page.scss';

interface QueueRoomActionMenuProps {
  queueRoom: QueueRoom;
}

const QueueRoomActionMenu: React.FC<QueueRoomActionMenuProps> = ({ queueRoom }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const handleEditQueueRoom = useCallback(() => {
    launchWorkspace2('service-queues-room-workspace', { queueRoom });
  }, [queueRoom]);

  const handleDeleteQueueRoom = useCallback(() => {
    const dispose = showModal('delete-queue-room-modal', {
      queueRoom,
      closeModal: () => dispose(),
    });
  }, [queueRoom]);

  return (
    <Layer>
      <OverflowMenu aria-label={t('actions', 'Actions')} size={isTablet ? 'lg' : 'sm'} flipped align="left">
        <OverflowMenuItem className={styles.menuitem} itemText={t('edit', 'Edit')} onClick={handleEditQueueRoom} />
        <OverflowMenuItem
          className={styles.menuitem}
          isDelete
          itemText={t('delete', 'Delete')}
          onClick={handleDeleteQueueRoom}
        />
      </OverflowMenu>
    </Layer>
  );
};

export default QueueRoomActionMenu;
