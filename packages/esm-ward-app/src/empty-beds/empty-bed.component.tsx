import React from 'react';
import styles from './empty-bed.scss';

interface EmptyBedProps {
  bedNumber: string;
}

const EmptyBed: React.FC<EmptyBedProps> = ({ bedNumber }) => {
  return (
    <div className={styles.container}>
      <span className={styles.bedNumber}>{bedNumber}</span>
      <p className={styles.emptyBed}>Empty Bed</p>
    </div>
  );
};

export default EmptyBed;
