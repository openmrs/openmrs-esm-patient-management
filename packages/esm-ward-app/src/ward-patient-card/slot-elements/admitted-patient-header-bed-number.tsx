import React from 'react';
import styles from "../admitted-patient-details.scss"
import type { AdmittedPatientHeaderProps } from './admitted-patient-header';

const AdmittedPatientHeaderBedNumber: React.FC<AdmittedPatientHeaderProps> = ({bed}) => {
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.admittedPatientBedNumber}>{bed.bedNumber}</span>
    </div>
  );
};

export default AdmittedPatientHeaderBedNumber;
