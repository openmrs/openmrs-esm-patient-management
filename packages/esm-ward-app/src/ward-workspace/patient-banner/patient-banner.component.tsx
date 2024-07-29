import React from 'react';
import type { WardPatient } from '../../types';
import {
  useCurrentWardCardConfig,
  WardPatientCardElement,
} from '../../ward-patient-card/ward-patient-card-row.resources';
import styles from './style.scss';

const WardPatientWorkspaceBanner = (props: WardPatient) => {
  const { headerRowElements } = useCurrentWardCardConfig();
  const { patient, bed, visit, firstAdmissionOrTransferEncounter, encounterAssigningToCurrentInpatientLocation } =
    props;

  if (!(patient && bed && visit)) return null;

  return (
    <div className={styles.patientBanner}>
      {headerRowElements.map((elementId, i) => (
        <WardPatientCardElement
          key={`ward-card-${patient.uuid}-header-${i}`}
          elementId={elementId}
          patient={patient}
          visit={visit}
          firstAdmissionOrTransferEncounter={firstAdmissionOrTransferEncounter}
          encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
        />
      ))}
    </div>
  );
};

export default WardPatientWorkspaceBanner;
