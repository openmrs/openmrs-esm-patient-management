import {
  Button,
  FormGroup,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router-dom';
import { z } from 'zod';
import { saveBedTag } from '../summary/summary.resource';
import { type BedTagData } from '../types';

interface BedTagFormProps {
  mutate: () => void;
  closeModal: () => void;
}

interface ErrorType {
  message: string;
}

const BedTagAdministrationSchema = z.object({
  name: z.string().max(255),
});

const NewTagForm: React.FC<BedTagFormProps> = ({ closeModal, mutate }) => {
  const { t } = useTranslation();
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formStateError, setFormStateError] = useState('');

  const initialData: BedTagData = {
    name: '',
    uuid: '',
  };

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<BedTagData>({
    mode: 'all',
    resolver: zodResolver(BedTagAdministrationSchema),
    defaultValues: {
      name: initialData.name || '',
    },
  });

  const onSubmit = (formData: BedTagData) => {
    const result = BedTagAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleCreateBedTag(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  const handleCreateBedTag = useCallback(
    (formData: BedTagData) => {
      const { name } = formData;

      const bedTagPayload = {
        name,
      };

      saveBedTag({ bedTagPayload })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTagCreated', 'Bed tag created'),
            subtitle: t('bedTagCreatedSuccessfully', `${name} created successfully`, {
              bedTag: name,
            }),
          });
          mutate();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingForm', 'Error creating bed'),
            subtitle: error?.message,
          });
        })
        .finally(() => {
          closeModal();
        });
    },
    [mutate, t],
  );

  return (
    <React.Fragment>
      <ModalHeader title={t('createBedTag', 'Create bed tag')} />
      <ModalBody hasScrollingContent>
        <Form>
          <Stack gap={3}>
            <FormGroup legendText={''}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="bedTag"
                      labelText={t('bedTag', 'Bed tag')}
                      placeholder={t('bedTagPlaceholder', '')}
                      invalidText={fieldState.error?.message}
                      {...field}
                    />
                  </>
                )}
              />
            </FormGroup>

            {showErrorNotification && (
              <InlineNotification
                lowContrast
                title={t('error', 'Error')}
                style={{ minWidth: '100%', margin: '0', padding: '0' }}
                role="alert"
                kind="error"
                subtitle={t('pleaseFillField', formStateError) + '.'}
                onClose={() => setShowErrorNotification(false)}
              />
            )}
          </Stack>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button disabled={!isDirty} onClick={handleSubmit(onSubmit, onError)}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};

export default NewTagForm;
