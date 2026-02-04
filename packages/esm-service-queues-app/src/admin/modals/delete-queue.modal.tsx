import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { useSWRConfig } from 'swr';
import { showSnackbar } from '@openmrs/esm-framework';
import { retireQueue } from '../queues/queue.resource';
import { queuesMutationKey } from '../queue-admin.resource';

interface DeleteQueueModalProps {
  closeModal: () => void;
  queue: { uuid: string; name: string };
}

const DeleteQueueModal: React.FC<DeleteQueueModalProps> = ({ closeModal, queue }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await retireQueue(queue.uuid);
      showSnackbar({
        kind: 'success',
        title: t('queueDeleted', 'Queue deleted'),
        subtitle: `${queue.name}`,
      });
      closeModal();
      await mutate(queuesMutationKey);
    } catch (error) {
      showSnackbar({
        kind: 'error',
        title: t('errorDeletingQueue', 'Error deleting queue'),
        subtitle: error?.responseBody?.message || error?.message,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [closeModal, mutate, queue.uuid, queue.name, t]);

  return (
    <>
      <ModalHeader closeModal={closeModal} title={t('deleteQueue', 'Delete queue')} />
      <ModalBody>
        <p>
          {t('deleteQueueConfirmation', 'Are you sure you want to delete the queue "{{name}}"?', {
            name: queue.name,
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

export default DeleteQueueModal;
