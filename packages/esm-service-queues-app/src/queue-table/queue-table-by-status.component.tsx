import { InlineNotification, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './queue-table.scss';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { type Concept, type Queue, type QueueTableTabConfig } from '../types';
import { queueTableComingFromColumn } from './cells/queue-table-coming-from-cell.component';
import { queueTableNameColumn } from './cells/queue-table-name-cell.component';
import { queueTablePriorityColumn } from './cells/queue-table-priority-cell.component';
import { queueTableStatusColumn } from './cells/queue-table-status-cell.component';
import { queueTableWaitTimeColumn } from './cells/queue-table-wait-time-cell.component';
import { QueueTableByStatusSkeleton } from './queue-table-by-status-skeleton.component';
import QueueTable from './queue-table.component';
import { queueTableActionsColumn } from './cells/queue-table-actions-cell.component';

interface QueueTableByStatusProps {
  selectedQueue: Queue; // the selected queue
  selectedStatus: Concept; // the selected status

  // Table configuration for each status, keyed by status uuid
  // If not provided, defaults to defaultQueueTableConfig
  configByStatus?: Map<string, QueueTableTabConfig>;

  allStatusTabConfig?: QueueTableTabConfig; // If provided, we display an additional tab for *all* statuses with the given config
}

const defaultQueueTableConfig: QueueTableTabConfig = {
  columns: [
    queueTableNameColumn,
    queueTableComingFromColumn,
    queueTablePriorityColumn,
    queueTableStatusColumn,
    queueTableWaitTimeColumn,
    queueTableActionsColumn,
  ],
};

const QueueTableByStatus: React.FC<QueueTableByStatusProps> = ({
  selectedQueue,
  selectedStatus,
  configByStatus,
  allStatusTabConfig,
}) => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { queueEntries, isLoading } = useQueueEntries({ queue: selectedQueue.uuid });
  const allowedStatuses = selectedQueue.allowedStatuses;

  const currentStatusUuid = selectedStatus?.uuid;

  const currentStatusIndex = Math.max(0, allowedStatuses?.findIndex((s) => s.uuid == currentStatusUuid));

  const queueEntriesForCurrentStatus = queueEntries?.filter(
    (entry) => !currentStatusUuid || entry.status.uuid == currentStatusUuid,
  );

  const tableConfig = configByStatus?.get(currentStatusUuid) ?? defaultQueueTableConfig;

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
              <QueueTable queueEntries={queueEntriesForCurrentStatus} queueTableColumns={tableConfig.columns} />
            </TabPanel>
          ))}
          {allStatusTabConfig && (
            <TabPanel>
              <QueueTable queueEntries={queueEntriesForCurrentStatus} queueTableColumns={allStatusTabConfig.columns} />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default QueueTableByStatus;
