import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import BedTagsAdministrationForm from './bed-tags-admin-form.modal';
import { saveBedTag, useBedTags, useLocationsWithAdmissionTag } from '../summary/summary.resource';
import { type BedTagData } from '../types';

interface BedTagFormProps {
  mutate: () => void;
  closeModal: () => void;
}

const NewTagForm: React.FC<BedTagFormProps> = ({ closeModal, mutate }) => {
  const { t } = useTranslation();
  const { admissionLocations } = useLocationsWithAdmissionTag();
  const { bedTags } = useBedTags();
  const headerTitle = t('createBedTag', 'Create bed tag');

  const initialData: BedTagData = {
    name: '',
    uuid: '',
  };

  const handleCreateBedTag = useCallback(
    (formData: BedTagData) => {
      const { name } = formData;

      const bedTagPayload = {
        name,
      };

      saveBedTag({ bedTagPayload })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTagCreated', 'Bed tag created'),
            subtitle: t('bedTagCreatedSuccessfully', `${name} created successfully`, {
              bedTag: name,
            }),
          });
          mutate();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingForm', 'Error creating bed'),
            subtitle: error?.message,
          });
        })
        .finally(closeModal);
    },
    [closeModal, t, mutate],
  );

  return (
    <BedTagsAdministrationForm
      allLocations={admissionLocations}
      availableBedTags={bedTags}
      handleCreateBedTag={handleCreateBedTag}
      headerTitle={headerTitle}
      initialData={initialData}
      closeModal={closeModal}
    />
  );
};

export default NewTagForm;
