import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast, showNotification } from '@openmrs/esm-framework';

import type { BedFormData } from '../types';
import { useBedType, saveBed } from './bed-administration.resource';
import BedAdministrationForm from './bed-administration-form.component';
import { useLocationsWithAdmissionTag } from '../summary/summary.resource';
import { type BedAdministrationData } from './bed-administration-types';

interface NewBedFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  mutate: () => any;
}

const NewBedForm: React.FC<NewBedFormProps> = ({ showModal, onModalChange, mutate }) => {
  const { t } = useTranslation();
  const { data: admissionLocations } = useLocationsWithAdmissionTag();
  const headerTitle = t('createNewBed', 'Create a new bed');
  const occupancyStatuses = ['Available', 'Occupied'];
  const { bedTypes } = useBedType();
  const availableBedTypes = bedTypes ? bedTypes : [];

  const initialData: BedFormData = {
    id: 0,
    uuid: '',
    bedNumber: '',
    status: null,
    description: '',
    row: 0,
    column: 0,
    location: {
      display: '',
      uuid: '',
    },
    bedType: null,
  };

  const handleCreateQuestion = useCallback(
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
          showToast({
            title: t('formCreated', 'New bed created'),
            kind: 'success',
            critical: true,
            description: `Bed ${bedId} was created successfully.`,
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
    [onModalChange, mutate, t],
  );

  return (
    <>
      <BedAdministrationForm
        onModalChange={onModalChange}
        allLocations={admissionLocations}
        availableBedTypes={availableBedTypes}
        showModal={showModal}
        handleCreateQuestion={handleCreateQuestion}
        headerTitle={headerTitle}
        occupancyStatuses={occupancyStatuses}
        initialData={initialData}
      />
    </>
  );
};

export default NewBedForm;
