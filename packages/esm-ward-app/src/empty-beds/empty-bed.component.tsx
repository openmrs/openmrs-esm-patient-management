import React from 'react';
import styles from './empty-bed.scss';
import admittedPatientHeaderStyles from '../admitted-patient/admitted-patient-header/admitted-patient-header.scss';
import { type Bed } from '../types';

interface EmptyBedProps {
  bed: Bed;
}

const EmptyBed: React.FC<EmptyBedProps> = ({ bed }) => {
  return (
    <div className={styles.container}>
      <span className={admittedPatientHeaderStyles.bedNumber}>{bed.bedNumber}</span>
      <p className={styles.emptyBed}>Empty Bed</p>
    </div>
  );
};

export default EmptyBed;
