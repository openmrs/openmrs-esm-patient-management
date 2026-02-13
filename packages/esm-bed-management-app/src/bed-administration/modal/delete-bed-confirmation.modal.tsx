import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, InlineLoading, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { deleteBed } from '../../summary/summary.resource';
import styles from './delete-bed-confirmation.scss';

const deleteBedSchema = z.object({
  reason: z.string().max(255).optional().default(''),
});

type DeleteBedFormData = z.infer<typeof deleteBedSchema>;

interface DeleteBedProps {
  closeModal: () => void;
  uuid: string;
  mutateBeds: () => void;
}

const DeleteBed: React.FC<DeleteBedProps> = ({ closeModal, uuid, mutateBeds }) => {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const { handleSubmit, control, watch } = useForm<DeleteBedFormData>({
    defaultValues: { reason: '' },
    mode: 'all',
    resolver: zodResolver(deleteBedSchema),
  });

  const deleteReason = watch('reason');

  const onSubmit = async (formData: DeleteBedFormData) => {
    setIsDeleting(true);

    try {
      await deleteBed({ bedId: uuid, reason: formData.reason.trim() });

      mutateBeds();
      closeModal();

      showSnackbar({
        title: t('bedDeleted', 'Bed deleted'),
        subtitle: t('bedDeleteSuccess', 'Bed deleted successfully'),
        kind: 'success',
      });
    } catch (err: any) {
      const translatedMessage = err?.responseBody?.error?.translatedMessage;
      const message =
        typeof translatedMessage === 'string'
          ? translatedMessage
          : t('deleteFailedTryAgain', 'Unable to delete bed. Please try again.');

      showSnackbar({
        title: t('bedDeleteFailed', 'Failed to delete bed'),
        subtitle: message,
        kind: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        title={t('deleteBedConfirmation', 'Are you sure you want to delete this bed?')}
      />

      <ModalBody className={styles.modalBody}>
        <Form>
          <Controller
            control={control}
            name="reason"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                id="delete-bed-reason"
                invalid={fieldState.invalid}
                invalidText={fieldState.error?.message}
                labelText={t('reasonForDeletingBed', 'Reason for deleting the bed')}
                placeholder={t('reasonForDeletingBedPlaceholder', 'Enter a reason for deleting this bed')}
              />
            )}
          />
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>

        <Button kind="danger" disabled={isDeleting || !deleteReason.trim()} onClick={handleSubmit(onSubmit)}>
          {isDeleting ? (
            <InlineLoading className={styles.spinner} description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteBed;
