import React from 'react';
import { SkeletonIcon, SkeletonText } from '@carbon/react';
import styles from './compact-patient-banner.scss';

export const Loader = () => {
  return (
    <div className={styles.patientSearchResult} data-testid="search-skeleton">
      <div className={styles.patientAvatar} role="img">
        <SkeletonIcon className={styles.skeletonIcon} />
      </div>
      <div>
        <SkeletonText />
        <span className={styles.demographics}>
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span> <SkeletonIcon />{' '}
          <span className={styles.middot}>&middot;</span> <SkeletonIcon />
        </span>
      </div>
    </div>
  );
};

export default Loader;
