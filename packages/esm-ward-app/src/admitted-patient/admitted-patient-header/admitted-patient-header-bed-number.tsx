import React from 'react';
import styles from "../admitted-patient-details.scss"

const admittedPatientHeaderBedNumber = () => {
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.admittedPatientBedNumber}>{1}</span>
    </div>
  );
};

export default admittedPatientHeaderBedNumber;
