import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@carbon/react';
import { useSWRConfig } from 'swr';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { retireQueue } from '../queue-services/queue-service.resource';

interface DeleteQueueModalProps {
  closeModal: () => void;
  queue: { uuid: string; name: string };
}

const DeleteQueueModal: React.FC<DeleteQueueModalProps> = ({ closeModal, queue }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();

  const onDelete = async () => {
    try {
      await retireQueue(queue.uuid);
      showSnackbar({
        kind: 'success',
        title: t('queueDeleted', 'Queue deleted'),
        subtitle: t('queueDeletedSuccessfully', 'Queue deleted successfully'),
      });
      closeModal();
      mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/queue`));
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorDeletingQueue', 'Error deleting queue'),
        subtitle: error?.message,
      });
    }
  };

  return (
    <Modal
      open
      danger
      modalHeading={t('deleteQueue', 'Delete Queue')}
      primaryButtonText={t('delete', 'Delete')}
      secondaryButtonText={t('cancel', 'Cancel')}
      onRequestClose={closeModal}
      onRequestSubmit={onDelete}>
      <p>
        {t('deleteQueueConfirmation', 'Are you sure you want to delete the queue "{{name}}"?', { name: queue.name })}
      </p>
    </Modal>
  );
};

export default DeleteQueueModal;
