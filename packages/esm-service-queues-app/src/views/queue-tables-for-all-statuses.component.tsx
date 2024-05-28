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
import type { Concept, Queue, QueueEntry, QueueTableColumn, QueueTableTabConfig } from '../types';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import ClinicMetrics from '../patient-queue-metrics/clinic-metrics.component';
import MetricsHeader from '../patient-queue-metrics/metrics-header.component';

interface QueueTablesForAllStatusesProps {
  selectedQueue: Queue; // the selected queue
}

// displays the queue entries of a given queue by
// showing one table per status
const QueueTablesForAllStatuses: React.FC<QueueTablesForAllStatusesProps> = ({ selectedQueue }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const { queueEntries, isLoading } = useQueueEntries({ queue: selectedQueue.uuid, isEnded: false });
  const allowedStatuses = selectedQueue.allowedStatuses;
  const [searchTerm, setSearchTerm] = useState('');

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
    <>
      <PatientQueueHeader title={selectedQueue?.display} hideLocationDropdown />
      <QueueTableMetrics selectedQueue={selectedQueue} />

      {/* <MetricsHeader /> */}
      <div className={styles.container}>
        <div className={styles.headerContainer}>
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
            <div className={styles.filterSearch}>
              <Search
                labelText=""
                placeholder={t('filterTable', 'Filter table')}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isDesktop(layout) ? 'sm' : 'lg'}
              />
            </div>
          </div>
        </div>
        <div>
          <QueueTableMetrics selectedQueue={selectedQueue} />
        </div>

        {allowedStatuses?.map((status) => (
          <QueueTableForQueueAndStatus
            key={status.uuid}
            queueEntries={queueEntries}
            searchTerm={searchTerm}
            queue={selectedQueue}
            status={status}
          />
        ))}
      </div>
    </>
  );
};

interface QueueTableForQueueAndStatus {
  queueEntries: QueueEntry[];
  searchTerm: string;
  queue: Queue;
  status: Concept;
}

// renders a table for a particular queue and status within the QueueTablesForAllStatuses view
function QueueTableForQueueAndStatus({ queueEntries, searchTerm, queue, status }: QueueTableForQueueAndStatus) {
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
      <h5 className={styles.statusTableHeader}>{status.display}</h5>
      <QueueTable key={statusUuid} queueEntries={filteredQueueEntries} queueUuid={queue.uuid} statusUuid={statusUuid} />
    </div>
  );
}

export default QueueTablesForAllStatuses;
