import { SkeletonIcon } from '@carbon/react';
import React from 'react';
import styles from './empty-bed.scss';
import WardPatientSkeletonText from '../ward-patient-card/row-elements/ward-pateint-skeleton-text';

const EmptyBedSkeleton = () => {
  return (
    <div className={styles.container + ' ' + styles.skeleton}>
      <SkeletonIcon />
      <WardPatientSkeletonText />
    </div>
  );
};

export default EmptyBedSkeleton;
