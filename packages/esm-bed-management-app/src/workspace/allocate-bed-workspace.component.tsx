import React, { useCallback, useState } from "react";
import classNames from "classnames";
import { Stack, ButtonSet, Button } from "@carbon/react";
import { useTranslation } from "react-i18next";
import {
  showNotification,
  showToast,
  useLayoutType,
} from "@openmrs/esm-framework";
import styles from "./allocate-bed.scss";
import Overlay from "./overlay.component";
import {
  assignPatientBed,
  endPatientQueue,
} from "../bed-admission/bed-admission.resource";
import BedLayoutList from "../bed-admission/bed-layout/bed-layout-list.component";
import LocationComboBox from "../bed-admission/admitted-patients/location-combo-box.component";
import { Bed } from "../types";

interface WorkSpaceProps {
  closePanel: (e: boolean) => void;
  headerTitle?: string;
  queueStatus: string;
  patientDetails: {
    name: string;
    patientUuid: string;
    locationUuid: string;
    locationTo: string;
    locationFrom: string;
    queueUuid: string;
    encounter: {
      uuid: string;
    };
  };
}

const AllocateBedWorkSpace: React.FC<WorkSpaceProps> = ({
  headerTitle,
  closePanel,
  patientDetails,
  queueStatus,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";
  const [selectedBed, setSelectedBed] = useState<Bed>();
  const [isBedAssigned, setIsBedAssigned] = useState(false);
  const [isQueueEnded, setIsQueueEnded] = useState(false);
  const [locationUuid, setLocation] = useState(patientDetails.locationUuid);

  const handleClick = (bed) => {
    setSelectedBed(bed);
  };

  if (isBedAssigned) {
    endPatientQueue({ status: "completed" }, patientDetails.queueUuid)
      .then(() => setIsQueueEnded(true))
      .catch((error) => {
        showNotification({
          title: t("errorEndingQueue", "Error Ending Queve"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      });
  }

  if (isQueueEnded) {
    showToast({
      title: t("bedAssigned", "Bed Assigned"),
      kind: "success",
      critical: true,
      description: `Bed ${selectedBed.bedNumber} was assigned to ${patientDetails.name} successfully.`,
    });
    closePanel(false);
  }

  const handleAssignBedToPatient = useCallback(() => {
    const patientAndEncounterUuids = {
      encounterUuid: patientDetails?.encounter?.uuid,
      patientUuid: patientDetails.patientUuid,
    };

    assignPatientBed(patientAndEncounterUuids, selectedBed.bedId)
      .then(() => setIsBedAssigned(true))
      .catch((error) => {
        showNotification({
          title: t("errorAssigningBed", "Error assigning bed"),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      });
  }, [patientDetails, selectedBed, t]);

  return (
    <>
      <Overlay header={headerTitle} closePanel={() => closePanel(false)}>
        <div className={styles.container}>
          <Stack gap={8} className={styles.container}>
            <section className={styles.section}>
              {queueStatus !== "completed" ? (
                ""
              ) : (
                <LocationComboBox setLocationUuid={setLocation} />
              )}
              <BedLayoutList
                locationUuid={locationUuid}
                handleClick={handleClick}
                patientDetails={patientDetails}
              />{" "}
            </section>
          </Stack>
        </div>
        {selectedBed && (
          <span className={styles.admitPatientInfo}>
            {" "}
            {t(
              "admittingPatientToBedText",
              `Click Save button to admit patient to Bed ${selectedBed.bedNumber}`
            )}
          </span>
        )}
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button
            className={styles.button}
            kind="secondary"
            onClick={closePanel}
          >
            {t("discard", "Discard")}
          </Button>
          <Button
            onClick={handleAssignBedToPatient}
            className={classNames(styles.button, {
              [styles.disabled]: !selectedBed,
            })}
            kind="primary"
            type="submit"
          >
            {t("save", "Save")}
          </Button>
        </ButtonSet>
      </Overlay>
    </>
  );
};

export default AllocateBedWorkSpace;
