import React from 'react';
import styles from '../ward-patient-card.scss';
import { type WardPatientCardBentoElement } from '../../types';

const WardPatientBedNumber: WardPatientCardBentoElement = ({ bed }) => {
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.wardPatientBedNumber}>{bed.bedNumber}</span>
    </div>
  );
};

export default WardPatientBedNumber;
