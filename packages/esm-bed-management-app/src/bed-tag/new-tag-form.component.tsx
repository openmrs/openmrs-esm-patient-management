import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { saveBedTag, useBedTags, useLocationsWithAdmissionTag } from '../summary/summary.resource';
import { type BedTagData } from '../types';
import BedTagsAdministrationForm from './bed-tags-admin-form.component';

interface BedTagFormProps {
  mutate: () => void;
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
}

const NewTagForm: React.FC<BedTagFormProps> = ({ showModal, onModalChange, mutate }) => {
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
        .finally(() => {
          onModalChange(false);
        });
    },
    [onModalChange, mutate, t],
  );

  return (
    <BedTagsAdministrationForm
      allLocations={admissionLocations}
      availableBedTags={bedTags}
      handleCreateBedTag={handleCreateBedTag}
      headerTitle={headerTitle}
      initialData={initialData}
      onModalChange={onModalChange}
      showModal={showModal}
    />
  );
};

export default NewTagForm;
