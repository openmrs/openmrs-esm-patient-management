import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextArea,
  TextInput,
  InlineNotification,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Location } from '@openmrs/esm-framework';
import type { BedType, BedTypeData } from '../../types';

const BedTypeAdministrationSchema = z.object({
  name: z.string().max(255),
  displayName: z.string().max(255),
  description: z.string().max(255),
});

interface BedAdministrationFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  availableBedTypes: Array<BedType>;
  allLocations: Location[];
  handleCreateQuestion?: (formData: BedTypeData) => void;
  headerTitle: string;
  initialData: BedTypeData;
}

interface ErrorType {
  message: string;
}

const BedTypeAdministrationForm: React.FC<BedAdministrationFormProps> = ({
  showModal,
  onModalChange,
  handleCreateQuestion,
  headerTitle,
  initialData,
}) => {
  const { t } = useTranslation();

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
      handleCreateQuestion(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
      <ModalHeader title={headerTitle} />
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <ModalBody hasScrollingContent>
          <Stack gap={3}>
            <FormGroup legendText={''}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="bedName"
                      labelText={t('bedName', 'Bed Name')}
                      placeholder={t('bedTypePlaceholder', '')}
                      invalidText={fieldState.error?.message}
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
                  <>
                    <TextInput
                      id="displayName"
                      labelText={t('displayName', 'Display Name')}
                      placeholder={t('displayNamePlaceholder', '')}
                      invalidText={fieldState.error?.message}
                      {...field}
                    />
                  </>
                )}
              />
            </FormGroup>
            <FormGroup>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextArea
                      rows={2}
                      id="description"
                      invalidText={fieldState?.error?.message}
                      labelText={t('description', 'Description')}
                      {...field}
                      placeholder={t('description', 'Enter the bed description')}
                    />
                  </>
                )}
              />
            </FormGroup>

            {showErrorNotification && (
              <InlineNotification
                lowContrast
                title={t('error', 'Error')}
                style={{ minWidth: '100%', margin: '0rem', padding: '0rem' }}
                role="alert"
                kind="error"
                subtitle={t('pleaseFillField', formStateError) + '.'}
                onClose={() => setShowErrorNotification(false)}
              />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => onModalChange(false)} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={!isDirty} type="submit">
            <span>{t('save', 'Save')}</span>
          </Button>
        </ModalFooter>
      </Form>
    </ComposedModal>
  );
};

export default BedTypeAdministrationForm;
