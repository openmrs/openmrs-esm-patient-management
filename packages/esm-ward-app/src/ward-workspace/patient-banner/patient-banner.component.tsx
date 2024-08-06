import React from 'react';
import type { WardPatient } from '../../types';
import { WardPatientCardElement } from '../../ward-patient-card/ward-patient-card-element.component';
import { useCurrentWardCardConfig } from '../../hooks/useCurrentWardCardConfig';
import styles from './style.scss';
import WardPatientBedNumber from '../../ward-patient-card/row-elements/ward-patient-bed-number';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';

const WardPatientWorkspaceBanner = (props: WardPatient) => {
  const { headerRowElements } = useCurrentWardCardConfig();
  const { patient, bed, visit, firstAdmissionOrTransferEncounter, encounterAssigningToCurrentInpatientLocation } =
    props;

  if (!(patient && visit)) {
    console.warn('Patient details and visit details where not received by the workspace');
    return null;
  }

  return (
    <div className={styles.patientBanner}>
      {bed ? <WardPatientBedNumber bed={bed} /> : null}
      <WardPatientName patient={patient} />
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
