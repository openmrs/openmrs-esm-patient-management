import React from 'react';
import styles from './empty-bed.scss';
import wardPatientCardStyles from '../ward-patient-card/ward-patient-card.scss';
import { type Bed } from '../types';

interface EmptyBedProps {
  bed: Bed;
}

const EmptyBed: React.FC<EmptyBedProps> = ({ bed }) => {
  return (
    <div className={styles.container}>
      <span className={`${wardPatientCardStyles.wardPatientBedNumber} ${wardPatientCardStyles.empty}`}>
        {bed.bedNumber}
      </span>
      <p className={styles.emptyBed}>Empty Bed</p>
    </div>
  );
};

export default EmptyBed;
