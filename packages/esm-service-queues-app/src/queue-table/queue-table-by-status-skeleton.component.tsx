import { DataTableSkeleton, SkeletonText, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import styles from './queue-table.scss';
import classNames from 'classnames';

export const QueueTableByStatusSkeleton = () => {
  const layout = useLayoutType();

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
