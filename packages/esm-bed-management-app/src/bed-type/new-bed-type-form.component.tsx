import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import BedTypeAdministrationForm from './bed-type-admin-form.modal';
import { saveBedType, useBedTypes, useLocationsWithAdmissionTag } from '../summary/summary.resource';
import type { BedType, BedTypeData, Mutator } from '../types';

interface BedTypeFormProps {
  mutate: Mutator<BedType>;
  closeModal: () => void;
}

const NewBedTypeForm: React.FC<BedTypeFormProps> = ({ mutate, closeModal }) => {
  const { t } = useTranslation();
  const { admissionLocations } = useLocationsWithAdmissionTag();
  const headerTitle = t('createBedType', 'Create bed type');
  const { bedTypes } = useBedTypes();

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

      saveBedType({ bedTypePayload })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTypeCreated', 'Bed type created'),
            subtitle: t('bedTypeCreatedSuccessfully', '{{bedType}} created successfully', {
              bedType: name,
            }),
          });
          mutate();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingBedType', 'Error creating bed type'),
            subtitle: error?.responseBody?.error?.message ?? error?.message,
          });
        })
        .finally(closeModal);
    },
    [closeModal, t, mutate],
  );

  return (
    <BedTypeAdministrationForm
      allLocations={admissionLocations}
      availableBedTypes={bedTypes}
      handleSubmission={handleCreateBedType}
      headerTitle={headerTitle}
      initialData={initialData}
      closeModal={closeModal}
    />
  );
};

export default NewBedTypeForm;
