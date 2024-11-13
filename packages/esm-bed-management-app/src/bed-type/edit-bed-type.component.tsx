import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { editBedType, useBedTypes } from '../summary/summary.resource';
import { type BedTypeDataAdministration } from '../bed-administration/bed-administration-types';
import { type BedType, type BedTypeData, type Mutator } from '../types';
import BedTypeAdministrationForm from './bed-type-admin-form.component';

interface EditBedTypeFormProps {
  editData: BedTypeData;
  mutate: Mutator<BedType>;
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
}

const EditBedTypeForm: React.FC<EditBedTypeFormProps> = ({ editData, mutate, onModalChange, showModal }) => {
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
            subtitle: t('bedTypeUpdatedSuccessfully', `${bedTypePayload.name} updated successfully`, {
              bedType: bedTypePayload.name,
            }),
            kind: 'success',
          });

          mutate();
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorCreatingForm', 'Error creating bed'),
            subtitle: error?.message,
            kind: 'error',
          });
        })
        .finally(() => {
          onModalChange(false);
        });
    },
    [onModalChange, mutate, editData, t],
  );

  return (
    <>
      <BedTypeAdministrationForm
        onModalChange={onModalChange}
        availableBedTypes={bedTypes}
        showModal={showModal}
        handleSubmission={handleUpdateBedType}
        headerTitle={headerTitle}
        initialData={editData}
        allLocations={[]}
      />
    </>
  );
};

export default EditBedTypeForm;
