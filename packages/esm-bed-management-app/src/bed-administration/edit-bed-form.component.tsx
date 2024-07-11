import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showToast, showNotification, useConfig } from "@openmrs/esm-framework";

import type { InitialData, Mutator } from "../types";
import { useBedType, editBed } from "./bed-administration.resource";
import BedAdministrationForm from "./bed-administration-form.component";
import { BedAdministrationData } from "./bed-administration-types";
import { useLocationsByTag } from "../summary/summary.resource";

interface EditBedFormProps {
  showModal: boolean;
  onModalChange: (showModal: boolean) => void;
  editData: InitialData;
  mutate: Mutator;
}

const EditBedForm: React.FC<EditBedFormProps> = ({
  showModal,
  onModalChange,
  editData,
  mutate,
}) => {
  const { t } = useTranslation();
  const { admissionLocationTagUuid } = useConfig();
  const { data: admissionLocations } = useLocationsByTag(
    admissionLocationTagUuid
  );

  const headerTitle = t("editBed", "Edit bed");
  const occupancyStatuses = ["Available", "Occupied"];
  const { bedTypes } = useBedType();
  const availableBedTypes = bedTypes ? bedTypes : [];
  const handleCreateQuestion = useCallback(
    (formData: BedAdministrationData) => {
      const bedUuid = editData.uuid;
      const {
        bedId = editData.bedNumber,
        description = editData.description,
        occupancyStatus = editData.status,
        bedRow = editData.row.toString(),
        bedColumn = editData.column.toString(),
        location: { uuid: bedLocation = editData.location.uuid },
        bedType = editData.bedType.name,
      } = formData;
      const bedPayload = {
        bedNumber: bedId,
        bedType,
        description,
        status: occupancyStatus.toUpperCase(),
        row: parseInt(bedRow),
        column: parseInt(bedColumn),
        locationUuid: bedLocation,
      };
      editBed({ bedPayload, bedId: bedUuid })
        .then(() => {
          showToast({
            title: t("formSaved", "Bed saved"),
            kind: "success",
            critical: true,
            description:
              bedPayload.bedNumber +
              " " +
              t("saveSuccessMessage", "was saved successfully."),
          });

          mutate();
          onModalChange(false);
        })
        .catch((error) => {
          showNotification({
            title: t("errorCreatingForm", "Error creating bed"),
            kind: "error",
            critical: true,
            description: error?.message,
          });
          onModalChange(false);
        });
      onModalChange(false);
    },
    [onModalChange, mutate, editData, t]
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
        initialData={editData}
      />
    </>
  );
};

export default EditBedForm;
