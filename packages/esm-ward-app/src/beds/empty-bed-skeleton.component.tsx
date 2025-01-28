import React from 'react';
import { SkeletonIcon } from '@carbon/react';
import WardPatientSkeletonText from '../ward-patient-card/row-elements/ward-patient-skeleton-text.component';
import styles from './ward-bed.scss';

const EmptyBedSkeleton = () => {
  return (
    <div className={styles.emptyBed + ' ' + styles.skeleton}>
      <SkeletonIcon />
      <WardPatientSkeletonText />
    </div>
  );
};

export default EmptyBedSkeleton;
