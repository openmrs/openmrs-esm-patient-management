import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@carbon/react';
import { useSWRConfig } from 'swr';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { retireQueueRoom } from '../queue-rooms/queue-room.resource';

interface DeleteQueueRoomModalProps {
  closeModal: () => void;
  queueRoom: { uuid: string; name: string };
}

const DeleteQueueRoomModal: React.FC<DeleteQueueRoomModalProps> = ({ closeModal, queueRoom }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();

  const onDelete = async () => {
    try {
      await retireQueueRoom(queueRoom.uuid);
      showSnackbar({
        kind: 'success',
        title: t('queueRoomDeleted', 'Queue room deleted'),
        subtitle: t('queueRoomDeletedSuccessfully', 'Queue room deleted successfully'),
      });
      closeModal();
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/queue-room`));
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorDeletingQueueRoom', 'Error deleting queue room'),
        subtitle: error?.message,
      });
    }
  };

  return (
    <Modal
      open
      danger
      modalHeading={t('deleteQueueRoom', 'Delete queue room')}
      primaryButtonText={t('delete', 'Delete')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestClose={closeModal}
      onRequestSubmit={onDelete}>
      <p>
        {t('deleteQueueRoomConfirmation', 'Are you sure you want to delete the queue room "{{name}}"?', {
          name: queueRoom.name,
        })}
      </p>
    </Modal>
  );
};

export default DeleteQueueRoomModal;
