import React, { useCallback, useState } from 'react';
import { InlineNotification } from '@carbon/react';
import { ExtensionSlot, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from '../queue-table/queue-table.scss';
import { useQueueEntries } from '../hooks/useQueueEntries';
import type { QueueEntry, Queue, QueueTableTabConfig, QueueTableColumn } from '../types';
import { queueTableComingFromColumn } from '../queue-table/cells/queue-table-coming-from-cell.component';
import { queueTableNameColumn } from '../queue-table/cells/queue-table-name-cell.component';
import { queueTablePriorityColumn } from '../queue-table/cells/queue-table-priority-cell.component';
import { queueTableStatusColumn } from '../queue-table/cells/queue-table-status-cell.component';
import { queueTableWaitTimeColumn } from '../queue-table/cells/queue-table-wait-time-cell.component';
import { QueueTableByStatusSkeleton } from '../queue-table/queue-table-by-status-skeleton.component';
import QueueTable from '../queue-table/queue-table.component';
import { queueTableActionColumn } from '../queue-table/cells/queue-table-action-cell.component';
import PatientSearch from '../patient-search/patient-search.component';
import { Add } from '@carbon/react/icons';
import { Search } from '@carbon/react';
import QueueTableMetrics from '../queue-table/queue-table-metrics.component';

interface QueueTablesForAllStatusesProps {
  selectedQueue: Queue; // the selected queue

  // Table configuration for each status, keyed by status uuid
  // If not provided, defaults to defaultQueueTableConfig
  configByStatus?: Map<string, QueueTableTabConfig>;
}

export const defaultQueueTableConfig: QueueTableTabConfig = {
  columns: [
    queueTableNameColumn,
    queueTableComingFromColumn,
    queueTablePriorityColumn,
    queueTableStatusColumn,
    queueTableWaitTimeColumn,
    queueTableActionColumn,
  ],
};

// displays the queue entries of a given queue by
// showing one table per status
const QueueTablesForAllStatuses: React.FC<QueueTablesForAllStatusesProps> = ({ selectedQueue, configByStatus }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const { queueEntries, isLoading } = useQueueEntries({ queue: selectedQueue.uuid, isEnded: false });
  const allowedStatuses = selectedQueue.allowedStatuses;
  const [showOverlay, setShowOverlay] = useState(false);
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // filters queue entries based on which status table we want to show and search term inputted by user
  const filterQueueEntries = useCallback(
    (queueEntries: QueueEntry[], searchTerm: string, statucUuid: string, columns: QueueTableColumn[]) => {
      const searchTermLowercase = searchTerm.toLowerCase();
      return queueEntries.filter((queueEntry) => {
        const match = columns.some((column) => {
          const columnSearchTerm = column(t).getFilterableValue?.(queueEntry)?.toLocaleLowerCase();
          return columnSearchTerm?.includes(searchTermLowercase);
        });
        return queueEntry.status.uuid == statucUuid && match;
      });
    },
    [queueEntries, searchTerm, selectedQueue, configByStatus],
  );

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
        <div>
          <QueueTableMetrics />
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
                setShowOverlay(true);
                setViewState({ selectedPatientUuid });
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
      {allowedStatuses?.map((status) => {
        const { uuid } = status;
        const tableConfig = configByStatus?.get(uuid) ?? defaultQueueTableConfig;
        const { columns } = tableConfig;
        const filteredQueueEntries = filterQueueEntries(queueEntries, searchTerm, uuid, columns);
        return (
          <div className={styles.statusTableContainer}>
            <h5 className={styles.statusTableHeader}>{status.display}</h5>
            <QueueTable key={uuid} queueEntries={filteredQueueEntries} queueTableColumns={tableConfig.columns} />
          </div>
        );
      })}
      {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} viewState={viewState} />}
    </div>
  );
};

export default QueueTablesForAllStatuses;
