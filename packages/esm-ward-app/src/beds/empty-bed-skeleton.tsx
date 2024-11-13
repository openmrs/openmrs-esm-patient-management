import { SkeletonIcon } from '@carbon/react';
import React from 'react';
import styles from './ward-bed.scss';
import WardPatientSkeletonText from '../ward-patient-card/row-elements/ward-patient-skeleton-text';

const EmptyBedSkeleton = () => {
  return (
    <div className={styles.emptyBed + ' ' + styles.skeleton}>
      <SkeletonIcon />
      <WardPatientSkeletonText />
    </div>
  );
};

export default EmptyBedSkeleton;
