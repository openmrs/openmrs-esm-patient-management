import React from 'react';
import styles from "../admitted-patient-details.scss"
import { WardPatientCardBentoElement } from '../../types';

const AdmittedPatientHeaderBedNumber: WardPatientCardBentoElement = ({bed}) => {
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.admittedPatientBedNumber}>{bed.bedNumber}</span>
    </div>
  );
};

export default AdmittedPatientHeaderBedNumber;
