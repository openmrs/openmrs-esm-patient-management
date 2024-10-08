import React from 'react';
import type { WardPatient } from '../../types';
import { WardPatientCardElement } from '../../ward-patient-card/ward-patient-card-element.component';
import { useCurrentWardCardConfig } from '../../hooks/useCurrentWardCardConfig';
import styles from './style.scss';
import WardPatientBedNumber from '../../ward-patient-card/row-elements/ward-patient-bed-number';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';

const WardPatientWorkspaceBanner = (wardPatient: WardPatient) => {
  const {  } = useCurrentWardCardConfig();
  const { patient, bed } = wardPatient;

  if (!patient) {
    console.warn('Patient details were not received by the ward workspace');
    return null;
  }

  return (
    <div className={styles.patientBanner}>
      {bed ? <WardPatientBedNumber bed={bed} /> : null}
      <WardPatientName patient={patient} />
      {/* TODO */}
      {/* {headerRowElements.map((elementId, i) => (
        <WardPatientCardElement key={`ward-card-${patient.uuid}-header-${i}`} elementId={elementId} {...wardPatient} />
      ))} */}
    </div>
  );
};

export default WardPatientWorkspaceBanner;
