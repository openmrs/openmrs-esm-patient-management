import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useTranslation } from 'react-i18next';
import { getCoreTranslation } from '@openmrs/esm-framework';
import type { BedTagData } from '../types';

const BedTagAdministrationSchema = z.object({
  name: z.string().max(255),
});

interface BedTagAdministrationFormProps {
  handleCreateBedTag?: (formData: BedTagData) => void;
  headerTitle: string;
  initialData: BedTagData;
  closeModal: () => void;
}

const BedTagsAdministrationForm: React.FC<BedTagAdministrationFormProps> = ({
  handleCreateBedTag,
  headerTitle,
  initialData,
  closeModal,
}) => {
  const { t } = useTranslation();

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
      name: initialData.name || '',
    },
  });

  const onSubmit = (formData: BedTagData) => {
    const result = BedTagAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleCreateBedTag?.(formData);
    }
  };

  const onError = (errors: FieldErrors<BedTagData>) => {
    const firstError = Object.values(errors)[0];
    setFormStateError(firstError?.message ?? 'Validation failed');
    setShowErrorNotification(true);
  };

  return (
    <React.Fragment>
      <ModalHeader title={headerTitle} closeModal={closeModal} />
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
                      labelText={t('bedTagName', 'Name of the bed tag')}
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

export default BedTagsAdministrationForm;
