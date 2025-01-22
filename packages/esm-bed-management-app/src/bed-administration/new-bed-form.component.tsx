import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { type BedWithLocation } from '../types';
import { type BedAdministrationData } from './bed-administration-types';
import { saveBed, useBedType } from './bed-administration.resource';
import { useLocationsWithAdmissionTag } from '../summary/summary.resource';
import BedAdministrationForm from './bed-administration-form.component';

interface NewBedFormProps {
  mutate: () => void;
  onModalChange: (showModal: boolean) => void;
  showModal: boolean;
  defaultLocation?: { display: string; uuid: string };
}

const NewBedForm: React.FC<NewBedFormProps> = ({ showModal, onModalChange, mutate, defaultLocation }) => {
  const { t } = useTranslation();
  const { admissionLocations } = useLocationsWithAdmissionTag();
  const { bedTypes } = useBedType();

  const headerTitle = t('createNewBed', 'Create a new bed');
  const occupancyStatuses = ['Available', 'Occupied'];
  const availableBedTypes = bedTypes ? bedTypes : [];

  const initialData: BedWithLocation = {
    bedNumber: '',
    bedType: null,
    column: 0,
    id: 0,
    location: defaultLocation || { display: '', uuid: '' },
    row: 0,
    status: null,
    uuid: '',
  };

  const handleCreateBed = useCallback(
    (formData: BedAdministrationData) => {
      const { bedId, occupancyStatus, bedRow, bedColumn, location, bedType } = formData;

      const bedObject = {
        bedNumber: bedId,
        bedType,
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
