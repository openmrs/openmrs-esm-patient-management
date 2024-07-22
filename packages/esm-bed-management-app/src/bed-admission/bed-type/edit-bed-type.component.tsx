import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast, showNotification, useConfig } from '@openmrs/esm-framework';

import { editBedType, useBedType } from '../../summary/summary.resource';
import { type BedTypeDataAdministration } from '../../bed-administration/bed-administration-types';
import { type BedTypeData, type Mutator } from '../../types';
import BedTypeAdministrationForm from './bed-type-admin-form.component';

interface EditBedTypeFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  editData: BedTypeData;
  mutate: Mutator;
}

const EditBedTypeForm: React.FC<EditBedTypeFormProps> = ({ showModal, onModalChange, editData, mutate }) => {
  const { t } = useTranslation();
  const headerTitle = t('editBedType', 'Edit Bed Type');
  const { bedTypeData } = useBedType();
  const availableBedTypes = bedTypeData ? bedTypeData : [];
  const handleCreateQuestion = useCallback(
    (formData: BedTypeDataAdministration) => {
      const bedUuid = editData.uuid;
      const { name, displayName, description } = formData;
      const bedPayload = {
        name,
        displayName,
        description,
      };
      editBedType({ bedPayload, bedTypeId: bedUuid })
        .then(() => {
          showToast({
            title: t('formSaved', 'Bed Type'),
            kind: 'success',
            critical: true,
            description: bedPayload.name + ' ' + t('saveSuccessMessage', 'was saved successfully.'),
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
    [onModalChange, mutate, editData, t],
  );

  return (
    <>
      <BedTypeAdministrationForm
        onModalChange={onModalChange}
        availableBedTypes={availableBedTypes}
        showModal={showModal}
        handleCreateQuestion={handleCreateQuestion}
        headerTitle={headerTitle}
        initialData={editData}
        allLocations={[]}
      />
    </>
  );
};

export default EditBedTypeForm;
