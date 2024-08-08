import React from 'react';
import styles from '../ward-patient-card.scss';
import { type WardPatientCardElement } from '../../types';

export interface WardPatientBedNumberProps {
  bed: {
    bedNumber: string;
  };
}

const WardPatientBedNumber: React.FC<WardPatientBedNumberProps> = ({ bed }) => {
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
