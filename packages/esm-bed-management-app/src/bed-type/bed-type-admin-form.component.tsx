import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextArea,
  TextInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation, type Location } from '@openmrs/esm-framework';
import type { BedType, BedTypeData } from '../types';

const BedTypeAdministrationSchema = z.object({
  name: z.string().max(255),
  displayName: z.string().max(255),
  description: z.string().max(255),
});

interface BedAdministrationFormProps {
  allLocations: Location[];
  availableBedTypes: Array<BedType>;
  handleSubmission?: (formData: BedTypeData) => void;
  headerTitle: string;
  initialData: BedTypeData;
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
}

interface ErrorType {
  message: string;
}

const BedTypeAdministrationForm: React.FC<BedAdministrationFormProps> = ({
  handleSubmission,
  headerTitle,
  initialData,
  onModalChange,
  showModal,
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
      handleSubmission?.(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)} preventCloseOnClickOutside>
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
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        <Button disabled={!isDirty} onClick={handleSubmit(onSubmit, onError)}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default BedTypeAdministrationForm;
