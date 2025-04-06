import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { editBedTag, useBedTags } from '../summary/summary.resource';
import { type BedTagData, type Mutator } from '../types';
import { type BedTagDataAdministration } from '../bed-administration/bed-administration-types';
import BedTagsAdministrationForm from './bed-tags-admin-form.component';

interface EditBedTagFormProps {
  editData: BedTagData;
  mutate: Mutator<BedTagData>;
  closeModal: () => void;
}

const EditBedTagForm: React.FC<EditBedTagFormProps> = ({ editData, mutate, closeModal }) => {
  const { t } = useTranslation();
  const { bedTags } = useBedTags();
  const headerTitle = t('editTag', 'Edit Tag');

  const handleUpdateBedTag = useCallback(
    (formData: BedTagDataAdministration) => {
      const bedUuid = editData.uuid;
      const { name } = formData;

      const bedTagPayload = {
        name,
      };

      editBedTag({ bedTagPayload, bedTagId: bedUuid })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTagUpdated', 'Bed tag updated'),
            subtitle: t('bedTagUpdatedSuccessfully', `${bedTagPayload.name} updated successfully`, {
              bedTag: bedTagPayload.name,
            }),
          });
          mutate();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingBedTag', 'Error creating bed tag'),
            subtitle: error?.message,
          });
        })
        .finally(closeModal);
    },
    [editData.uuid, closeModal, t, mutate],
  );

  return (
    <>
      <BedTagsAdministrationForm
        allLocations={[]}
        availableBedTags={bedTags}
        handleCreateBedTag={handleUpdateBedTag}
        headerTitle={headerTitle}
        initialData={editData}
        closeModal={closeModal}
      />
    </>
  );
};

export default EditBedTagForm;
