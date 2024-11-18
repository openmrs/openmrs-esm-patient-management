import {
  Button,
  Form,
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
import { z } from 'zod';
import { type BedTagDataAdministration } from '../bed-administration/bed-administration-types';
import { editBedTag } from '../summary/summary.resource';
import { type BedTagData, type Mutator } from '../types';

interface EditBedTagFormProps {
  editData: BedTagData;
  mutate: Mutator<BedTagData>;
  closeModal: () => void;
}

const BedTagAdministrationSchema = z.object({
  name: z.string().max(255),
});

interface BedTagAdministrationFormProps {
  allLocations: Location[];
  availableBedTags: Array<BedTagData>;
  handleCreateBedTag?: (formData: BedTagData) => void;
  handleDeleteBedTag?: () => void;
  headerTitle: string;
  initialData: BedTagData;
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
}

interface ErrorType {
  message: string;
}

const EditBedTagForm: React.FC<EditBedTagFormProps> = ({ editData, mutate, closeModal }) => {
  const { t } = useTranslation();

  const handleUpdateBedTag = useCallback(
    (formData: BedTagDataAdministration) => {
      const bedUuid = editData.uuid;
      const { name } = formData;

      const bedTagPayload = {
        name,
      };

      editBedTag({ bedTagPayload, bedTagId: bedUuid })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTagUpdated', 'Bed tag updated'),
            subtitle: t('bedTagUpdatedSuccessfully', `${bedTagPayload.name} updated successfully`, {
              bedTag: bedTagPayload.name,
            }),
          });
          mutate();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingBedTag', 'Error creating bed tag'),
            subtitle: error?.message,
          });
        })
        .finally(() => {
          closeModal();
        });
    },
    [mutate, editData, t],
  );

  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formStateError, setFormStateError] = useState('');

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<BedTagData>({
    mode: 'all',
    resolver: zodResolver(BedTagAdministrationSchema),
    defaultValues: {
      name: editData.name || '',
    },
  });

  const onSubmit = (formData: BedTagData) => {
    const result = BedTagAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleUpdateBedTag(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    <React.Fragment>
      <ModalHeader title={t('editTag', 'Edit Tag')} />
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

export default EditBedTagForm;
