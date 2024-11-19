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
  TextArea,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import { default as React, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { saveBedType } from '../summary/summary.resource';
import type { BedType, BedTypeData, Mutator } from '../types';
import styles from './new-bed-type.scss';

interface BedTypeFormProps {
  mutate: Mutator<BedType>;
  closeModal: () => void;
}

const BedTypeAdministrationSchema = z.object({
  name: z.string().max(255),
  displayName: z.string().max(255),
  description: z.string().max(255),
});

interface ErrorType {
  message: string;
}

const NewBedTypeForm: React.FC<BedTypeFormProps> = ({ mutate, closeModal }) => {
  const { t } = useTranslation();
  const headerTitle = t('createBedType', 'Create bed type');
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

  const initialData: BedTypeData = {
    description: '',
    displayName: '',
    name: '',
    uuid: '',
  };

  const handleCreateBedType = useCallback(
    (formData: BedTypeData) => {
      const { name, displayName, description } = formData;

      const bedTypePayload = {
        name,
        displayName,
        description,
      };

      setSubmissionStatus({
        isErrored: false,
        isSuccessful: undefined,
        isSubmitting: true,
        description: 'Submitting...',
      });
      saveBedType({ bedTypePayload })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTypeCreated', 'Bed type created'),
            subtitle: t('bedTypeCreatedSuccessfully', `${name} created successfully`, {
              bedType: name,
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

  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formStateError, setFormStateError] = useState('');

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<BedTypeData>({
    mode: 'all',
    resolver: zodResolver(BedTypeAdministrationSchema),
    defaultValues: {
      name: initialData.name || '',
      displayName: initialData.displayName || '',
      description: initialData.description || '',
    },
  });

  const onSubmit = (formData: BedTypeData) => {
    const result = BedTypeAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleCreateBedType(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    <React.Fragment>
      <ModalHeader title={headerTitle} />
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
                      id="bedName"
                      invalidText={fieldState.error?.message}
                      labelText={t('bedName', 'Bed name')}
                      placeholder={t('bedTypePlaceholder', '')}
                      {...field}
                    />
                  </>
                )}
              />
            </FormGroup>
            <FormGroup legendText={''}>
              <Controller
                name="displayName"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="displayName"
                    invalidText={fieldState.error?.message}
                    labelText={t('displayName', 'Display name')}
                    placeholder={t('displayNamePlaceholder', '')}
                    {...field}
                  />
                )}
              />
            </FormGroup>
            <FormGroup>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <TextArea
                    rows={2}
                    id="description"
                    invalidText={fieldState?.error?.message}
                    labelText={t('description', 'Description')}
                    {...field}
                    placeholder={t('enterBedDescription', 'Enter the bed description')}
                  />
                )}
              />
            </FormGroup>

            {showErrorNotification && (
              <InlineNotification
                kind="error"
                lowContrast
                onClose={() => setShowErrorNotification(false)}
                role="alert"
                style={{ minWidth: '100%', margin: '0', padding: '0' }}
                subtitle={t('pleaseFillField', formStateError) + '.'}
                title={t('error', 'Error')}
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

export default NewBedTypeForm;
