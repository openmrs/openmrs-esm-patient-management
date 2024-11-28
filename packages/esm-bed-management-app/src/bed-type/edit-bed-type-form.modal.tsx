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
import { type BedTypeDataAdministration } from '../bed-administration/bed-administration-types';
import { editBedType } from '../summary/summary.resource';
import { type BedType, type BedTypeData, type Mutator } from '../types';
import styles from './new-bed-type.scss';

interface EditBedTypeFormProps {
  editData: BedTypeData;
  mutate: Mutator<BedType>;
  closeModal: () => void;
}

interface ErrorType {
  message: string;
}

const BedTypeAdministrationSchema = z.object({
  name: z.string().max(255),
  displayName: z.string().max(255),
  description: z.string().max(255),
});

const EditBedTypeForm: React.FC<EditBedTypeFormProps> = ({ editData, mutate, closeModal }) => {
  const { t } = useTranslation();
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

  const handleUpdateBedType = useCallback(
    (formData: BedTypeDataAdministration) => {
      const bedUuid = editData.uuid;
      const { name, displayName, description } = formData;

      const bedTypePayload = {
        name,
        displayName,
        description,
      };

      setSubmissionStatus({
        description: 'editing...',
        isErrored: undefined,
        isSubmitting: true,
        isSuccessful: undefined,
      });

      editBedType({ bedTypePayload, bedTypeId: bedUuid })
        .then(() => {
          showSnackbar({
            title: t('bedTypeUpdated', 'Bed type updated'),
            subtitle: t('bedTypeUpdatedSuccessfully', `${bedTypePayload.name} updated successfully`, {
              bedType: bedTypePayload.name,
            }),
            kind: 'success',
          });

          setSubmissionStatus({
            description: 'edited.',
            isErrored: undefined,
            isSubmitting: false,
            isSuccessful: true,
          });

          mutate();
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorCreatingForm', 'Error creating bed'),
            subtitle: error?.message,
            kind: 'error',
          });
          setSubmissionStatus({ description: 'errorred', isErrored: true, isSubmitting: false, isSuccessful: false });
        })
        .finally(() => closeModal());
    },
    [mutate, editData],
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
      name: editData.name || '',
      displayName: editData.displayName || '',
      description: editData.description || '',
    },
  });

  const onSubmit = (formData: BedTypeData) => {
    const result = BedTypeAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleUpdateBedType(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    <React.Fragment>
      <ModalHeader title={t('editBedType', 'Edit bed type')} closeModal={closeModal} />
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

export default EditBedTypeForm;
