import React from 'react';
import styles from './empty-bed.scss';

interface EmptyBedProps {
  bedNum: number;
}

const EmptyBed: React.FC<EmptyBedProps> = ({ bedNum }) => {
  return (
    <div className={styles.container}>
      <span className={styles.bedNumber}>{bedNum}</span>
      <p className={styles.emptyBed}>Empty Bed</p>
    </div>
  );
};

export default EmptyBed;
