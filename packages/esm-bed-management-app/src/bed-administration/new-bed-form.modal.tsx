import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { type BedFormData } from '../types';
import { type BedAdministrationData } from './bed-administration-types';
import { saveBed, useBedType } from './bed-administration.resource';
import { useLocationsWithAdmissionTag } from '../summary/summary.resource';
import BedAdministrationForm from './bed-administration-form.component';

interface NewBedFormProps {
  mutate: () => void;
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
}

const NewBedForm: React.FC<NewBedFormProps> = ({ showModal, onModalChange, mutate }) => {
  const { t } = useTranslation();
  const { admissionLocations } = useLocationsWithAdmissionTag();
  const { bedTypes } = useBedType();

  const headerTitle = t('createNewBed', 'Create a new bed');
  const occupancyStatuses = ['Available', 'Occupied'];
  const availableBedTypes = bedTypes ? bedTypes : [];

  const initialData: BedFormData = {
    bedNumber: '',
    bedType: null,
    column: 0,
    description: '',
    id: 0,
    location: {
      display: '',
      uuid: '',
    },
    row: 0,
    status: null,
    uuid: '',
  };

  const handleCreateBed = useCallback(
    (formData: BedAdministrationData) => {
      const { bedId, description, occupancyStatus, bedRow, bedColumn, location, bedType } = formData;

      const bedObject = {
        bedNumber: bedId,
        bedType,
        description,
        status: occupancyStatus.toUpperCase(),
        row: parseInt(bedRow.toString()),
        column: parseInt(bedColumn.toString()),
        locationUuid: location.uuid,
      };

      saveBed({ bedPayload: bedObject })
        .then(() => {
          showSnackbar({
            title: t('newBedCreated', 'New bed created'),
            kind: 'success',
            subtitle: `Bed ${bedId} created successfully`,
          });

          mutate();
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorCreatingForm', 'Error creating bed'),
            kind: 'error',
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
    <BedAdministrationForm
      onModalChange={onModalChange}
      allLocations={admissionLocations}
      availableBedTypes={availableBedTypes}
      showModal={showModal}
      handleCreateBed={handleCreateBed}
      headerTitle={headerTitle}
      occupancyStatuses={occupancyStatuses}
      initialData={initialData}
    />
  );
};

export default NewBedForm;
