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
  TextInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { getCoreTranslation, type Location } from '@openmrs/esm-framework';
import type { BedTagData } from '../types';

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

const BedTagsAdministrationForm: React.FC<BedTagAdministrationFormProps> = ({
  handleCreateBedTag,
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
                      id="bedTag"
                      labelText={t('bedTags', 'Bed tags')}
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

export default BedTagsAdministrationForm;
