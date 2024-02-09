import { InlineNotification, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../active-visits/active-visits-table.scss';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { type Concept, type Queue, type QueueTableColumn, type QueueTableTabConfig } from '../types';
import QueueTableNameCell from './cells/queue-table-name-cell.component';
import { QueueTable } from './queue-table.component';
import QueueTableStatusCell from './cells/queue-table-status-cell.component';
import QueueTablePriorityCell from './cells/queue-table-priority-cell.component';
import { useNavigate } from 'react-router-dom';

interface QueueTableByStatusProps {
  queue: Queue;
  status: Concept;
  configByStatus?: Map<string, QueueTableTabConfig>;
  all?: QueueTableTabConfig;
}

const DefaultQueueTableColumns: QueueTableColumn[] = [
  {
    headerI18nKey: 'name',
    cellComponent: (queueEntry) => <QueueTableNameCell queueEntry={queueEntry} />,
  },
  {
    headerI18nKey: 'priority',
    cellComponent: (queueEntry) => <QueueTablePriorityCell queueEntry={queueEntry} />,
  },
  {
    headerI18nKey: 'status',
    cellComponent: (queueEntry) => <QueueTableStatusCell queueEntry={queueEntry} />,
  },
];

export const QueueTableByStatus: React.FC<QueueTableByStatusProps> = ({ queue, status, configByStatus, all }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { queueEntries, isLoading } = useQueueEntries({ queue: queue.uuid });
  const allowedStatuses = queue.allowedStatuses;

  const currentStatusUuid = status?.uuid;

  const currentStatusIndex = Math.max(0, allowedStatuses?.findIndex((s) => s.uuid == currentStatusUuid));

  const queueEntriesForCurrentStatus = queueEntries?.filter(
    (entry) => !currentStatusUuid || entry.status.uuid == currentStatusUuid,
  );

  const columnConfig = configByStatus?.get(currentStatusUuid) ?? { columns: DefaultQueueTableColumns };

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
          <h3>{queue.display}</h3>
        </div>
      </div>
      <Tabs
        selectedIndex={currentStatusIndex}
        onChange={({ selectedIndex }) => {
          const newStatusUuid = allowedStatuses[selectedIndex]?.uuid;
          const url = `/queue-table-by-status/${queue.uuid}` + (newStatusUuid ? '/' + newStatusUuid : '');
          navigate(url);
        }}
        className={styles.tabs}>
        <TabList className={styles.tabList} aria-label={t('queueStatus', 'Queue Status')} contained>
          {allowedStatuses?.map((s) => <Tab key={s?.uuid}>{s?.display}</Tab>)}
          {all && <Tab>{t('all', 'All')}</Tab>}
        </TabList>
        <TabPanels>
          {allowedStatuses?.map((s) => (
            <TabPanel key={s.uuid}>
              <QueueTable queueEntries={queueEntriesForCurrentStatus} queueTableColumns={columnConfig.columns} />
            </TabPanel>
          ))}
          {all && (
            <TabPanel>
              <QueueTable queueEntries={queueEntriesForCurrentStatus} queueTableColumns={all.columns} />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
};
