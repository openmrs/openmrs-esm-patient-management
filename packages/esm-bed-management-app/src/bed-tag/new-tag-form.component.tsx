import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast, showNotification, useConfig } from '@openmrs/esm-framework';
import { useBedType } from '../bed-administration/bed-administration.resource';
import BedTagsAdministrationForm from './bed-tags-admin-form.component';
import { saveBedTag, useLocationsWithAdmissionTag } from '../summary/summary.resource';
import { type BedTagData, type Mutator } from '../types';

interface BedTagFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  mutate: () => any;
}

const NewTagForm: React.FC<BedTagFormProps> = ({ showModal, onModalChange, mutate }) => {
  const { t } = useTranslation();
  const { data: admissionLocations } = useLocationsWithAdmissionTag();
  const headerTitle = t('addBedTag', 'Create Bed Tag');
  const { bedTypes } = useBedType();
  const availableBedTypes = bedTypes ? bedTypes : [];

  const initialData: BedTagData = {
    uuid: '',
    name: '',
  };

  const handleCreateQuestion = useCallback(
    (formData: BedTagData) => {
      const { name } = formData;

      const bedTagPayload = {
        name,
      };

      saveBedTag({ bedTagPayload })
        .then(() => {
          showToast({
            title: t('formCreated', 'Add Bed Tag'),
            kind: 'success',
            critical: true,
            description: `Tag ${name} was created successfully.`,
          });

          mutate();
          onModalChange(false);
        })
        .catch((error) => {
          showNotification({
            title: t('errorCreatingForm', 'Error creating bed'),
            kind: 'error',
            critical: true,
            description: error?.message,
          });
          onModalChange(false);
        });
      onModalChange(false);
    },
    [onModalChange, mutate, t],
  );

  return (
    <>
      <BedTagsAdministrationForm
        onModalChange={onModalChange}
        allLocations={admissionLocations}
        availableBedTypes={availableBedTypes}
        showModal={showModal}
        handleCreateQuestion={handleCreateQuestion}
        headerTitle={headerTitle}
        initialData={initialData}
      />
    </>
  );
};

export default NewTagForm;
