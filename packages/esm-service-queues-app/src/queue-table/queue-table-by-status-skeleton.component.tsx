import { DataTableSkeleton, SkeletonText } from '@carbon/react';
import React from 'react';
import styles from './queue-table.scss';

export const QueueTableByStatusSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.statusTableContainer}>
        <h5 className={styles.statusTableHeader}>
          <SkeletonText width={'40%'} />
        </h5>
        <DataTableSkeleton showHeader={false} />
      </div>
      <div className={styles.statusTableContainer}>
        <h5 className={styles.statusTableHeader}>
          <SkeletonText width={'40%'} />
        </h5>
        <DataTableSkeleton showHeader={false} />
      </div>
      <div className={styles.statusTableContainer}>
        <h5 className={styles.statusTableHeader}>
          <SkeletonText width={'40%'} />
        </h5>
        <DataTableSkeleton showHeader={false} />
      </div>
    </div>
  );
};
