import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, Stack, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation } from '@openmrs/esm-framework';
import type { BedTagData } from '../types';

export interface DeleteBedTagData {
  reason: string;
}

interface DeleteBedTagFormProps {
  bedTagData: BedTagData;
  closeModal: () => void;
  handleDeleteBedTag: (uuid: string, reason: string, bedTagData: BedTagData, closeModal: () => void) => void;
}

interface ErrorType {
  message: string;
}

const DeleteBedTagAdministrationSchema = z.object({
  reason: z.string().min(1).max(255),
});

const DeleteBedTagForm: React.FC<DeleteBedTagFormProps> = ({ bedTagData, handleDeleteBedTag, closeModal }) => {
  const { t } = useTranslation();

  const [isInvalid, setIsInvalid] = useState(false);
  const [formStateError, setFormStateError] = useState('');

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<DeleteBedTagData>({
    mode: 'all',
    resolver: zodResolver(DeleteBedTagAdministrationSchema),
  });

  const onSubmit = (formData: DeleteBedTagData) => {
    const result = DeleteBedTagAdministrationSchema.safeParse(formData);
    if (result.success) {
      setIsInvalid(false);
      handleDeleteBedTag(bedTagData.uuid, formData.reason, bedTagData, closeModal);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setIsInvalid(true);
  };

  return (
    <React.Fragment>
      <ModalHeader
        closeModal={closeModal}
        title={t('deleteTagConfirmation', 'Are you sure you want to delete this bed tag?')}
      />
      <ModalBody>
        <Form>
          <FormGroup legendText={''}>
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <TextInput
                  {...field}
                  id="bedTag"
                  invalidText={isInvalid && formStateError}
                  labelText={t('reasonForDeletingBedTag', 'Reason for deletion')}
                  placeholder={t('reasonForDeletingBedTagPlaceholder', 'Enter a reason for deletion')}
                />
              )}
              rules={{
                required: true,
              }}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button disabled={!isDirty} onClick={handleSubmit(onSubmit, onError)}>
          {getCoreTranslation('delete', 'Delete')}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};

export default DeleteBedTagForm;
