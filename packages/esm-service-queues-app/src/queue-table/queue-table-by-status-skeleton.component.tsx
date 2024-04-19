import { DataTableSkeleton, SkeletonText, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import styles from './queue-table.scss';

export const QueueTableByStatusSkeleton = () => {
  const layout = useLayoutType();

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
          <h3>
            <SkeletonText />
          </h3>
        </div>
      </div>
      <Tabs selectedIndex={0}>
        <TabList>
          <Tab>
            <SkeletonText />
          </Tab>
        </TabList>
      </Tabs>
      <TabPanels>
        <TabPanel>
          <DataTableSkeleton />
        </TabPanel>
      </TabPanels>
    </div>
  );
};
