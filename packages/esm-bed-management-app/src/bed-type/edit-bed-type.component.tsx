import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { editBedType, useBedTypes } from '../summary/summary.resource';
import { type BedTypeDataAdministration } from '../bed-administration/bed-administration-types';
import { type BedType, type BedTypeData, type Mutator } from '../types';
import BedTypeAdministrationForm from './bed-type-admin-form.modal';

interface EditBedTypeFormProps {
  editData: BedTypeData;
  mutate: Mutator<BedType>;
  closeModal: () => void;
}

const EditBedTypeForm: React.FC<EditBedTypeFormProps> = ({ editData, mutate, closeModal }) => {
  const { t } = useTranslation();
  const { bedTypes } = useBedTypes();
  const headerTitle = t('editBedType', 'Edit bed type');

  const handleUpdateBedType = useCallback(
    (formData: BedTypeDataAdministration) => {
      const bedUuid = editData.uuid;
      const { name, displayName, description } = formData;

      const bedTypePayload = {
        name,
        displayName,
        description,
      };

      editBedType({ bedTypePayload, bedTypeId: bedUuid })
        .then(() => {
          showSnackbar({
            title: t('bedTypeUpdated', 'Bed type updated'),
            subtitle: t('bedTypeUpdatedSuccessfully', '{{bedType}} updated successfully', {
              bedType: bedTypePayload.name,
            }),
            kind: 'success',
          });

          mutate();
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorCreatingBedType', 'Error creating bed type'),
            subtitle: error?.responseBody?.error?.message ?? error?.message,
            kind: 'error',
          });
        })
        .finally(closeModal);
    },
    [editData.uuid, t, mutate, closeModal],
  );

  return (
    <BedTypeAdministrationForm
      availableBedTypes={bedTypes}
      handleSubmission={handleUpdateBedType}
      headerTitle={headerTitle}
      initialData={editData}
      allLocations={[]}
      closeModal={closeModal}
    />
  );
};

export default EditBedTypeForm;
