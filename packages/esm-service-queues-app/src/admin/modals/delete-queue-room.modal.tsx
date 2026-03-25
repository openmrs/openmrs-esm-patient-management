import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useSWRConfig } from 'swr';
import { showSnackbar } from '@openmrs/esm-framework';
import { retireQueueRoom } from '../queue-rooms/queue-room.resource';
import { queueRoomsMutationKey } from '../queue-admin.resource';

interface DeleteQueueRoomModalProps {
  closeModal: () => void;
  queueRoom: { uuid: string; name: string };
}

const DeleteQueueRoomModal: React.FC<DeleteQueueRoomModalProps> = ({ closeModal, queueRoom }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await retireQueueRoom(queueRoom.uuid);
      showSnackbar({
        kind: 'success',
        title: t('queueRoomDeleted', 'Queue room deleted'),
        subtitle: `${queueRoom.name}`,
      });
      closeModal();
      await mutate(queueRoomsMutationKey);
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorDeletingQueueRoom', 'Error deleting queue room'),
        subtitle: error?.responseBody?.message || error?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [closeModal, mutate, queueRoom.uuid, queueRoom.name, t]);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('deleteQueueRoom', 'Delete queue room')} />
      <ModalBody>
        <p>
          {t('deleteQueueRoomConfirmation', 'Are you sure you want to delete the queue room "{{name}}"?', {
            name: queueRoom.name,
          })}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" disabled={isDeleting} onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" disabled={isDeleting} onClick={onDelete}>
          {isDeleting ? <InlineLoading description={t('deleting', 'Deleting') + '...'} /> : t('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteQueueRoomModal;
