import { InlineNotification, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './queue-table.scss';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { type Concept, type Queue, type QueueTableTabConfig } from '../types';
import { QueueTableByStatusSkeleton } from './queue-table-by-status-skeleton.component';
import QueueTable from './queue-table.component';

interface QueueTableByStatusProps {
  selectedQueue: Queue; // the selected queue
  selectedStatus: Concept; // the selected status
  allStatusTabConfig?: QueueTableTabConfig; // If provided, we display an additional tab for *all* statuses with the given config
}

// displays the queue entries of a given queue by
// showing a list of tabs (one tab per status), each showing
// queue entries within that status
const QueueTableByStatus: React.FC<QueueTableByStatusProps> = ({
  selectedQueue,
  selectedStatus,
  allStatusTabConfig,
}) => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { queueEntries, isLoading, isValidating } = useQueueEntries({ queue: selectedQueue.uuid, isEnded: false });
  const allowedStatuses = selectedQueue.allowedStatuses;

  const currentStatusUuid = selectedStatus?.uuid ?? allowedStatuses?.[0]?.uuid;
  const currentStatusIndex = allowedStatuses?.findIndex((s) => s.uuid == currentStatusUuid);

  const noStatuses = !allowedStatuses?.length;
  if (isLoading) {
    return <QueueTableByStatusSkeleton />;
  } else if (noStatuses) {
    return (
      <InlineNotification
        kind={'error'}
        lowContrast
        subtitle={t('configureStatus', 'Please configure status to continue.')}
        title={t('noStatusConfigured', 'No status configured')}
      />
    );
  }

  const queueEntriesForCurrentStatus = queueEntries?.filter((entry) => entry.status.uuid == currentStatusUuid);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
          <h3>{selectedQueue.display}</h3>
        </div>
      </div>
      <Tabs
        selectedIndex={currentStatusIndex}
        onChange={({ selectedIndex }) => {
          const newStatusUuid = allowedStatuses[selectedIndex]?.uuid;
          const url = `/queue-table-by-status/${selectedQueue.uuid}` + (newStatusUuid ? '/' + newStatusUuid : '');
          navigate(url);
        }}>
        <TabList className={styles.tabList} aria-label={t('queueStatus', 'Queue Status')} contained>
          {allowedStatuses?.map((s) => <Tab key={s?.uuid}>{s?.display}</Tab>)}
          {allStatusTabConfig && <Tab>{t('all', 'All')}</Tab>}
        </TabList>
        <TabPanels>
          {allowedStatuses?.map((s) => (
            <TabPanel key={s.uuid}>
              <QueueTable
                queueEntries={queueEntriesForCurrentStatus}
                queueUuid={selectedQueue.uuid}
                statusUuid={s.uuid}
              />
            </TabPanel>
          ))}
          {allStatusTabConfig && (
            <TabPanel>
              <QueueTable
                queueEntries={queueEntriesForCurrentStatus}
                isValidating={isValidating}
                queueUuid={selectedQueue.uuid}
                statusUuid={null}
              />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default QueueTableByStatus;
