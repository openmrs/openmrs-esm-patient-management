import React from 'react';
import { type Bed } from '../../types';
import styles from '../ward-patient-card.scss';

const WardPatientBedNumber: React.FC<{ bed: Bed }> = ({ bed }) => {
  if (!bed) {
    return <></>;
  }
  return (
    <div className={styles.bedNumberBox}>
      <span className={styles.wardPatientBedNumber}>{bed.bedNumber}</span>
    </div>
  );
};

export default WardPatientBedNumber;
