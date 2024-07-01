import { SkeletonIcon } from '@carbon/react';
import React from 'react';
import styles from './empty-bed.scss';

const EmptyBedSkeleton = () => {
  return (
    <div className={styles.container + ' ' + styles.skeleton}>
      <SkeletonIcon />
      <SkeletonIcon className={styles.skeletonText} />
    </div>
  );
};

export default EmptyBedSkeleton;
