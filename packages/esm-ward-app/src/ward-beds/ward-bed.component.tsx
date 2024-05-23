import React from 'react';
import EmptyBed from './empty-bed.component';
import styles from './ward-bed.scss';

const WardBed = () => {
  return (
    <div className={styles.bedsContainer}>
      {[...Array(20)].map((ele, i) => (
        <EmptyBed bedNum={i + 1} key={`${i}`} />
      ))}
    </div>
  );
};

export default WardBed;
