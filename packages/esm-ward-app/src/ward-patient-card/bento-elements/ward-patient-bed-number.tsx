import React from 'react';
import styles from '../admitted-patient-details.scss';
import { type WardPatientCardBentoElement } from '../../types';

const WardPatientBedNumber: WardPatientCardBentoElement = ({ bed }) => {
  if (!bed) return <></>;
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.admittedPatientBedNumber}>{bed.bedNumber}</span>
    </div>
  );
};

export default WardPatientBedNumber;
