import React from 'react';
import styles from '../ward-patient-card.scss';
import { type WardPatientCardElement } from '../../types';

const WardPatientBedNumber: WardPatientCardElement = ({ bed }) => {
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.wardPatientBedNumber}>{bed.bedNumber}</span>
    </div>
  );
};

export default WardPatientBedNumber;
