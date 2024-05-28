import React from 'react';
import styles from './empty-bed.scss';
import { SkeletonIcon, SkeletonText } from '@carbon/react';

const EmptyBedSkeleton = () => {
  return (
    <div className={styles.container + ' ' + styles.skeleton}>
      <SkeletonIcon />
      <SkeletonIcon className={styles.skeletonText} />
    </div>
  );
};

export default EmptyBedSkeleton;
