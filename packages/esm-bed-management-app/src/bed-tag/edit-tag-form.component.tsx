import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast, showNotification, useConfig } from '@openmrs/esm-framework';

import { editBedTag, useBedTag } from '../summary/summary.resource';
import { type BedTagDataAdministration } from '../bed-administration/bed-administration-types';
import BedTagsAdministrationForm from './bed-tags-admin-form.component';
import { type BedTagData, type Mutator } from '../types';

interface EditBedTagFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  editData: BedTagData;
  mutate: Mutator;
}

const EditBedTagForm: React.FC<EditBedTagFormProps> = ({ showModal, onModalChange, editData, mutate }) => {
  const { t } = useTranslation();

  const headerTitle = t('editBed', 'Edit Tag');
  const { bedTypeData } = useBedTag();
  const availableBedTypes = bedTypeData ? bedTypeData : [];

  const handleCreateQuestion = useCallback(
    (formData: BedTagDataAdministration) => {
      const bedUuid = editData.uuid;
      const { name } = formData;
      const bedTagPayload = {
        name,
      };
      editBedTag({ bedTagPayload, bedTagId: bedUuid })
        .then(() => {
          showToast({
            title: t('formSaved', 'Bed Tag'),
            kind: 'success',
            critical: true,
            description: bedTagPayload.name + ' ' + t('saveSuccessMessage', 'was saved successfully.'),
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
      <BedTagsAdministrationForm
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

export default EditBedTagForm;
