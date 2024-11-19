import {
  Button,
  Form,
  FormGroup,
  InlineLoading,
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
import { z } from 'zod';
import { saveBedTag } from '../summary/summary.resource';
import { type BedTagData } from '../types';
import styles from './new-tag.scss';

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
  console.log('close-modal', closeModal);
  const { t } = useTranslation();
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formStateError, setFormStateError] = useState('');
  const [{ isErrored, isSubmitting, isSuccessful, description }, setSubmissionStatus] = useState<{
    isSubmitting: boolean;
    isSuccessful: boolean | undefined;
    isErrored: boolean | undefined;
    description: string | undefined;
  }>({
    isSubmitting: false,
    isSuccessful: false,
    isErrored: undefined,
    description: undefined,
  });

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

      setSubmissionStatus({
        isErrored: false,
        isSuccessful: undefined,
        isSubmitting: true,
        description: 'Submitting...',
      });
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
          setSubmissionStatus({
            isErrored: false,
            isSuccessful: true,
            isSubmitting: false,
            description: 'Saved...',
          });
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingForm', 'Error creating bed'),
            subtitle: error?.message,
          });
          setSubmissionStatus({
            isErrored: true,
            isSuccessful: false,
            isSubmitting: false,
            description: 'Errored',
          });
        })
        .finally(() => closeModal());
    },
    [mutate, t],
  );

  return (
    <React.Fragment>
      <ModalHeader title={t('createBedTag', 'Create bed tag')} closeModal={closeModal} />
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
        {isSubmitting || isErrored || isSuccessful ? (
          <Button>
            <InlineLoading
              status={isSubmitting ? 'active' : isErrored ? 'error' : isSuccessful ? 'finished' : 'inactive'}
              description={description}
              className={styles.inlineLoading}
            />
          </Button>
        ) : (
          <Button disabled={!isDirty} onClick={handleSubmit(onSubmit, onError)}>
            {t('save', 'save')}
          </Button>
        )}
      </ModalFooter>
    </React.Fragment>
  );
};

export default NewTagForm;
