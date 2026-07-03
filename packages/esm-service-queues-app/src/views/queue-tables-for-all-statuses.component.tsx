import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import QueueTable from './queue-table/queue-table.component';
import QueueTableByStatusSkeleton from './queue-table/queue-table-by-status-skeleton.component';
import { useColumns } from './queue-table/hooks/useColumns';
import { useQueueEntries } from '../service-queues.resource';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './queue-tables-for-all-statuses.scss';
import AddPatientToQueueButton from '../queue-table/components/add-patient-to-queue-button.component';
import { isDesktop } from '@openmrs/esm-framework';
import { type Queue, type QueueEntry } from '../types';
import { Search } from '@carbon/react';

interface QueueTablesForAllStatusesProps {
  selectedQueue: Queue;
  isLoadingQueue: boolean;
  errorFetchingQueue?: Error | null;
}

const QueueTablesForAllStatuses: React.FC<QueueTablesForAllStatusesProps> = ({
  selectedQueue,
  isLoadingQueue,
  errorFetchingQueue,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [searchTerm, setSearchTerm] = React.useState('');

  if (errorFetchingQueue) {
    return (
      <InlineNotification
        kind="error"
        title={t('invalidQueue', 'Invalid Queue')}
        subtitle={
          errorFetchingQueue?.message ??
          t('somethingWentWrong', 'Something went wrong')
        }
      />
    );
  }

  if (isLoadingQueue) {
    return <QueueTableByStatusSkeleton />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.patientSearchBar}>
        <div className={styles.searchBar}>
          <Search
            labelText=""
            placeholder={t('filterTable', 'Filter table')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            size={isDesktop(layout) ? 'sm' : 'lg'}
            disabled={isLoadingQueue}
          />
        </div>
        <AddPatientToQueueButton selectedQueue={selectedQueue} />
      </div>
      <div className={styles.queueTables}>
        <QueueTablesByStatus selectedQueue={selectedQueue} searchTerm={searchTerm} />
      </div>
    </div>
  );
};

interface QueueTablesByStatusProps {
  selectedQueue: Queue;
  searchTerm: string;
}

function QueueTablesByStatus({ selectedQueue, searchTerm }: QueueTablesByStatusProps) {
  const { t } = useTranslation();
  const { queueEntries = [], isLoading, isValidating } = useQueueEntries({ queue: selectedQueue.uuid, isEnded: false });
  const allowedStatuses = [...(selectedQueue.allowedStatuses ?? [])].reverse();
  const noStatuses = !allowedStatuses?.length;

  if (isLoading) {
    return <QueueTableByStatusSkeleton />;
  }

  if (noStatuses) {
    return (
      <InlineNotification
        kind="warning"
        title={t('invalidtableConfig', 'Invalid table configuration')}
        subtitle={t('noColumnsDefined', 'No columns configured for this table')}
      />
    );
  }

  return (
    <div>
      {allowedStatuses?.map((status) => (
        <QueueTableForQueueAndStatus
          key={status.uuid}
          queue={selectedQueue}
          status={status}
          queueEntries={queueEntries}
          isValidating={isValidating}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  );
}

interface QueueTableForQueueAndStatusProps {
  queue: Queue;
  status: { uuid: string; display: string };
  queueEntries: QueueEntry[];
  isValidating: boolean;
  searchTerm: string;
}

function QueueTableForQueueAndStatus({
  queue,
  status,
  queueEntries,
  isValidating,
  searchTerm,
}: QueueTableForQueueAndStatusProps) {
  const statusUuid = status.uuid;
  const columns = useColumns(queue.uuid, statusUuid);
  const { t } = useTranslation();

  if (columns.length === 0) {
    return (
      <InlineNotification
        kind="warning"
        title={t('invalidtableConfig', 'Invalid table configuration')}
        subtitle={t('noColumnsDefined', 'No columns configured for this table')}
      />
    );
  }

  if (!columns) {
    return (
      <InlineNotification
        kind="warning"
        title={t('invalidtableConfig', 'Invalid table configuration')}
        subtitle={t('noColumnsDefined', 'No columns configured for this table')}
      />
    );
  }

  const filterQueueEntries = (
    queueEntries: QueueEntry[],
    searchTerm: string,
    statusUuid: string
  ) => {
    const searchTermLowercase = searchTerm.toLowerCase();

    return queueEntries.filter((queueEntry) => {
      if (queueEntry.status?.uuid !== statusUuid) return false;

      if (!searchTermLowercase) return true;

      return columns.some((column) => {
        const value = column.getFilterableValue?.(queueEntry);

        return String(value ?? '')
          .toLowerCase()
          .includes(searchTermLowercase);
      });
    });
  };

  const filteredQueueEntries = filterQueueEntries(queueEntries, searchTerm, statusUuid);

  return (
    <div className={styles.statusTableContainer}>
      <h5 className={styles.statusTableHeader}>{status.display}</h5>
      <div className={styles.container}>
        <QueueTable
          key={statusUuid}
          queueEntries={filteredQueueEntries}
          isValidating={isValidating}
          queueUuid={queue.uuid}
          statusUuid={statusUuid}
        />
      </div>
    </div>
  );
}

export default QueueTablesForAllStatuses;
