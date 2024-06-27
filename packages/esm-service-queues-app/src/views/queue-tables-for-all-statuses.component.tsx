import React, { useCallback, useState } from 'react';
import { InlineNotification, Search } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot, isDesktop, launchWorkspace, showToast, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { useColumns } from '../queue-table/cells/columns.resource';
import { QueueTableByStatusSkeleton } from '../queue-table/queue-table-by-status-skeleton.component';
import QueueTable from '../queue-table/queue-table.component';
import QueueTableMetrics from '../queue-table/queue-table-metrics.component';
import styles from '../queue-table/queue-table.scss';
import type { Concept, Queue, QueueEntry } from '../types';

interface QueueTablesForAllStatusesProps {
  selectedQueue: Queue; // the selected queue
}

// displays the queue entries of a given queue by
// showing one table per status
const QueueTablesForAllStatuses: React.FC<QueueTablesForAllStatusesProps> = ({ selectedQueue }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const { queueEntries, isLoading, isValidating } = useQueueEntries({ queue: selectedQueue.uuid, isEnded: false });
  const allowedStatuses = selectedQueue.allowedStatuses;
  const [searchTerm, setSearchTerm] = useState('');

  const noStatuses = !allowedStatuses?.length;
  if (isLoading && !queueEntries.length) {
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
        <div>
          <QueueTableMetrics selectedQueue={selectedQueue} />
        </div>
        <div className={styles.headerButtons}>
          <ExtensionSlot
            name="patient-search-button-slot"
            state={{
              buttonText: t('addPatientToQueue', 'Add patient to queue'),
              overlayHeader: t('addPatientToQueue', 'Add patient to queue'),
              buttonProps: {
                kind: 'secondary',
                renderIcon: (props) => <Add size={16} {...props} />,
                size: 'sm',
              },
              selectPatientAction: (selectedPatientUuid) => {
                launchWorkspace('service-queues-patient-search', {
                  selectedPatientUuid,
                  currentServiceQueueUuid: selectedQueue.uuid,
                });
              },
            }}
          />
          <Search
            labelText=""
            placeholder={t('filterTable', 'Filter table')}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isDesktop(layout) ? 'sm' : 'lg'}
          />
        </div>
      </div>
      {allowedStatuses?.map((status) => (
        <QueueTableForQueueAndStatus
          key={status.uuid}
          queueEntries={queueEntries}
          searchTerm={searchTerm}
          queue={selectedQueue}
          status={status}
          isValidating={isValidating}
        />
      ))}
    </div>
  );
};

interface QueueTableForQueueAndStatus {
  queueEntries: QueueEntry[];
  isValidating: boolean;
  searchTerm: string;
  queue: Queue;
  status: Concept;
}

// renders a table for a particular queue and status within the QueueTablesForAllStatuses view
function QueueTableForQueueAndStatus({
  queueEntries,
  isValidating,
  searchTerm,
  queue,
  status,
}: QueueTableForQueueAndStatus) {
  const statusUuid = status.uuid;
  const columns = useColumns(queue.uuid, statusUuid);
  const { t } = useTranslation();

  if (!columns) {
    showToast({
      title: t('invalidtableConfig', 'Invalid table configuration'),
      kind: 'warning',
      description: 'No table columns defined by queue ' + queue.uuid + ' and status ' + statusUuid,
    });
  }

  // filters queue entries based on which status table we want to show and search term inputted by user
  const filterQueueEntries = useCallback(
    (queueEntries: QueueEntry[], searchTerm: string, statucUuid: string) => {
      const searchTermLowercase = searchTerm.toLowerCase();
      return queueEntries.filter((queueEntry) => {
        const match = columns.some((column) => {
          const columnSearchTerm = column.getFilterableValue?.(queueEntry)?.toLocaleLowerCase();
          return columnSearchTerm?.includes(searchTermLowercase);
        });
        return queueEntry.status.uuid == statucUuid && match;
      });
    },
    [queueEntries, searchTerm, columns],
  );

  const filteredQueueEntries = filterQueueEntries(queueEntries, searchTerm, statusUuid);
  return (
    <div className={styles.statusTableContainer}>
      <QueueTable
        key={statusUuid}
        queueEntries={filteredQueueEntries}
        header={status.display}
        isValidating={isValidating}
        queueUuid={queue.uuid}
        statusUuid={statusUuid}
      />
    </div>
  );
}

export default QueueTablesForAllStatuses;
