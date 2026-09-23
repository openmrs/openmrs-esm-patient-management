import React from 'react';
import { DataTableSkeleton, Layer, SkeletonText } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import styles from './queue-table.scss';

// Stands in for the status tables DefaultQueueTable renders once the queue resolves, so it uses the
// same section chrome. Two of them: a queue's waiting list plus whatever it moves patients on to.
const statusTableCount = 2;

export const QueueTableByStatusSkeleton = () => {
  const layout = useLayoutType();

  return (
    <>
      {Array.from({ length: statusTableCount }, (_, index) => (
        <div className={styles.defaultQueueTable} key={index}>
          <Layer className={styles.tableSection}>
            <div className={styles.headerContainer}>
              <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
                <SkeletonText heading width="40%" />
              </div>
            </div>
            <DataTableSkeleton compact={isDesktop(layout)} showHeader={false} zebra />
          </Layer>
        </div>
      ))}
    </>
  );
};
