import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation } from '@openmrs/esm-framework';
import type { BedTypeData } from '../types';

export interface DeleteBedTypeFormData {
  reason: string;
}

interface DeleteBedTypeFormFormProps {
  bedTypeData: BedTypeData;
  closeModal: () => void;
  handleDeleteBedType: (uuid: string, reason: string, bedTypeData: BedTypeData, closeModal: () => void) => void;
}

interface ErrorType {
  message: string;
}

const DeleteBedTypeFormAdministrationSchema = z.object({
  reason: z.string().min(1).max(255),
});

const DeleteBedTypeForm: React.FC<DeleteBedTypeFormFormProps> = ({ bedTypeData, handleDeleteBedType, closeModal }) => {
  const { t } = useTranslation();

  const [isInvalid, setIsInvalid] = useState(false);
  const [formStateError, setFormStateError] = useState('');

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<DeleteBedTypeFormData>({
    mode: 'all',
    resolver: zodResolver(DeleteBedTypeFormAdministrationSchema),
  });

  const onSubmit = (formData: DeleteBedTypeFormData) => {
    const result = DeleteBedTypeFormAdministrationSchema.safeParse(formData);
    if (result.success) {
      setIsInvalid(false);
      handleDeleteBedType(bedTypeData.uuid, formData.reason, bedTypeData, closeModal);
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
        title={t('deleteBedTypeConfirmation', 'Are you sure you want to delete this bed type?')}
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
                  id="bedType"
                  invalidText={isInvalid && formStateError}
                  labelText={t('reasonForDeletingBedType', 'Reason for deleting the bed type')}
                  placeholder={t('reasonForDeletingBedTypePlaceholder', 'Enter a reason for deleting this bed type')}
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

export default DeleteBedTypeForm;
