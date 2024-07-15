import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast, showNotification, useConfig } from '@openmrs/esm-framework';
import type { BedTypeData, Mutator } from '../types';
import { useBedType } from '../bed-administration/bed-administration.resource';
import { saveBedType, useLocationsWithAdmissionTag } from '../summary/summary.resource';
import BedTypeAdministrationForm from './bed-type-admin-form.component';

interface BedTypeFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  mutate: Mutator;
}

const NewBedTypeForm: React.FC<BedTypeFormProps> = ({ showModal, onModalChange, mutate }) => {
  const { t } = useTranslation();
  const { data: admissionLocations } = useLocationsWithAdmissionTag();
  const headerTitle = t('addBedType', 'Create Bed type');
  const { bedTypes } = useBedType();
  const availableBedTypes = bedTypes ? bedTypes : [];

  const initialData: BedTypeData = {
    uuid: '',
    name: '',
    displayName: '',
    description: '',
  };

  const handleCreateQuestion = useCallback(
    (formData: BedTypeData) => {
      const { name, displayName, description } = formData;

      const bedTypePayload = {
        name,
        displayName,
        description,
      };

      saveBedType({ bedTypePayload })
        .then(() => {
          showToast({
            title: t('formCreated', 'Add bed Type'),
            kind: 'success',
            critical: true,
            description: `Bed ${name} was created successfully.`,
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
      <BedTypeAdministrationForm
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

export default NewBedTypeForm;
