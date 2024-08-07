import React from 'react';
import styles from '../ward-patient-card.scss';
import { Bed } from '../../types';

const WardPatientBedNumber: React.FC<{bed: Bed}> = ({ bed }) => {
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
