import { InlineNotification, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnmappedVisitQueueEntries } from '../active-visits/active-visits-table.resource';
import styles from '../active-visits/active-visits-table.scss';
import { useSelectedServiceUuid } from '../helpers/helpers';
import { useQueues } from '../helpers/useQueues';
import { type AllowedStatus } from '../types';
import { QueueTable } from './queue-table.component';

export const QueueTableByStatus: React.FC = () => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const { visitQueueEntries, isLoading } = useUnmappedVisitQueueEntries();
  const currentQueueUuid = useSelectedServiceUuid();
  const { queues } = useQueues();

  const allQueueAllowedStatuses = useCallback(() => {
    const allStatusFromAllQueues = queues.flatMap((q) => q.allowedStatuses);
    const statusByUuid = new Map<string, AllowedStatus>();
    for (const status of allStatusFromAllQueues) {
      statusByUuid.set(status.uuid, status);
    }
    return [...statusByUuid.values()];
  }, [queues]);

  const currentQueue = queues.find((q) => q.uuid === currentQueueUuid);
  const allowedStatuses = currentQueue?.allowedStatuses ?? allQueueAllowedStatuses();

  const [currentStatusUuid, setCurrentStatusUuid] = useState<string>(allowedStatuses?.[0]?.uuid);

  useEffect(() => {
    if (currentQueue) {
      const newQueueHasCurrentStatus = currentQueue?.allowedStatuses?.some((s) => s.uuid == currentStatusUuid);
      if (!newQueueHasCurrentStatus) {
        setCurrentStatusUuid(currentQueue.allowedStatuses?.[0]?.uuid);
      }
    }
  }, [currentQueue]);

  const currentStatusIndex = Math.max(0, allowedStatuses?.findIndex((s) => s.uuid == currentStatusUuid));

  const visitQueueEntriesByQueueAndStatus = visitQueueEntries
    ?.filter((entry) => !currentQueueUuid || entry.queueEntry.queue.uuid == currentQueueUuid)
    ?.filter((entry) => !currentStatusUuid || entry.queueEntry.status.uuid == currentStatusUuid);

  const noStatuses = !allowedStatuses?.length;
  if (isLoading) {
    return <>{t('loading', 'Loading....')}</>;
  } else if (noStatuses) {
    return (
      <InlineNotification
        className={styles.inlineNotification}
        kind={'error'}
        lowContrast
        subtitle={t('configureStatus', 'Please configure status to continue.')}
        title={t('noStatusConfigured', 'No status configured')}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
          <h3>{currentQueue?.display ?? t('allQueues', 'All Queues')}</h3>
        </div>
      </div>
      <Tabs
        selectedIndex={currentStatusIndex}
        onChange={({ selectedIndex }) => setCurrentStatusUuid(allowedStatuses[selectedIndex].uuid)}
        className={styles.tabs}>
        <TabList className={styles.tabList} aria-label={t('queueStatus', 'Queue Status')} contained>
          {allowedStatuses?.map((s) => <Tab key={s?.uuid}>{s?.display}</Tab>)}
        </TabList>
        <TabPanels>
          {allowedStatuses?.map((s) => (
            <TabPanel key={s.uuid}>
              <QueueTable queueEntries={visitQueueEntriesByQueueAndStatus} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};
