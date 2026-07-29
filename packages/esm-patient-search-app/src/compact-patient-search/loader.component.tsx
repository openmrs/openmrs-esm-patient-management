import React from 'react';
import { SkeletonIcon, SkeletonText } from '@carbon/react';
import styles from './compact-patient-banner.scss';

// Memoized: the skeleton is static, so it never needs to re-render as the list scrolls.
export const Loader = React.memo(() => {
  return (
    <div className={styles.patientSearchResult} data-testid="search-skeleton">
      <div className={styles.patientAvatar}>
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
});
Loader.displayName = 'Loader';

export default Loader;
