import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { type BedAdministrationData } from './bed-administration-types';
import { type BedWithLocation } from '../types';
import { editBed, useBedType } from './bed-administration.resource';
import { useLocationsWithAdmissionTag } from '../summary/summary.resource';
import BedAdministrationForm from './bed-administration-form.component';

interface EditBedFormProps {
  editData: BedWithLocation;
  mutate: () => void;
  closeModal: () => void;
}

const EditBedForm: React.FC<EditBedFormProps> = ({ closeModal, editData, mutate }) => {
  const { t } = useTranslation();
  const { admissionLocations } = useLocationsWithAdmissionTag();
  const { bedTypes } = useBedType();
  const availableBedTypes = bedTypes ? bedTypes : [];
  const headerTitle = t('editBed', 'Edit bed');
  const occupancyStatuses = ['Available', 'Occupied'];

  const handleCreateBed = useCallback(
    (formData: BedAdministrationData) => {
      const bedUuid = editData.uuid;

      const {
        bedColumn = editData.column.toString(),
        bedId = editData.bedNumber,
        bedRow = editData.row.toString(),
        bedType = editData.bedType.name,
        location: { uuid: bedLocation = editData.location.uuid },
        occupancyStatus = editData.status,
      } = formData;

      const bedPayload = {
        bedNumber: bedId,
        bedType,
        column: parseInt(bedColumn),
        locationUuid: bedLocation,
        row: parseInt(bedRow),
        status: occupancyStatus.toUpperCase(),
      };

      editBed({ bedPayload, bedId: bedUuid })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedUpdated', 'Bed updated'),
            subtitle: t('bedUpdatedSuccessfully', '{{bedNumber}} updated successfully', {
              bedNumber: bedPayload.bedNumber,
            }),
          });

          mutate();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorCreatingForm', 'Error creating bed'),
            subtitle: error?.responseBody?.error?.message ?? error?.message,
          });
        })
        .finally(closeModal);
    },
    [
      closeModal,
      editData.bedNumber,
      editData.bedType.name,
      editData.column,
      editData.location.uuid,
      editData.row,
      editData.status,
      editData.uuid,
      mutate,
      t,
    ],
  );

  return (
    <BedAdministrationForm
      allLocations={admissionLocations}
      availableBedTypes={availableBedTypes}
      handleCreateBed={handleCreateBed}
      headerTitle={headerTitle}
      initialData={editData}
      occupancyStatuses={occupancyStatuses}
      closeModal={closeModal}
    />
  );
};

export default EditBedForm;
