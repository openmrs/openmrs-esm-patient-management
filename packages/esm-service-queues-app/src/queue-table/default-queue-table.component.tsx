import React, { useEffect, useMemo, useState } from 'react';
import { DataTableSkeleton, Layer, TableToolbarSearch } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { isDesktop, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useServiceQueuesStore } from '../store/store';
import { useColumns } from './cells/columns.resource';
import { useQueueEntries } from '../hooks/useQueueEntries';
import AddPatientToQueueButton from './components/add-patient-to-queue-button.component';
import QueueTable from './queue-table.component';
import QueueTableExpandedRow from './queue-table-expanded-row.component';
import { type Concept } from '../types';
import { type ConfigObject } from '../config-schema';
import styles from './queue-table.scss';

interface DefaultQueueTableProps {
  /** Scope to a single queue. Without it, the selected location and service are used. */
  queueUuid?: string;
  /** The status to list. Without it, the configured waiting status is used. */
  status?: Concept;
}

function DefaultQueueTable({ queueUuid, status }: DefaultQueueTableProps) {
  return (
    <div className={styles.defaultQueueTable}>
      <Layer className={styles.tableSection}>
        <QueueTableSection queueUuid={queueUuid} status={status} />
      </Layer>
    </div>
  );
}

function QueueTableSection({ queueUuid, status }: DefaultQueueTableProps) {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const {
    concepts: { waitingStatusConceptUuid },
  } = useConfig<ConfigObject>();
  const [searchTerm, setSearchTerm] = useState('');
  const statusUuid = status?.uuid ?? waitingStatusConceptUuid;

  // One status per table; in-service patients live in the Attending cards rather than a table.
  const searchCriteria = useMemo(() => {
    return queueUuid
      ? { queue: queueUuid, isEnded: false, status: statusUuid }
      : {
          service: selectedServiceUuid,
          location: selectedQueueLocationUuid,
          isEnded: false,
          status: statusUuid,
        };
  }, [queueUuid, selectedServiceUuid, selectedQueueLocationUuid, statusUuid]);

  const { queueEntries, isLoading, error, isValidating, totalCount } = useQueueEntries(searchCriteria);

  useEffect(() => {
    if (error?.message) {
      showSnackbar({
        title: t('errorLoadingQueueEntries', 'Error loading queue entries'),
        kind: 'error',
        subtitle: error?.message,
      });
    }
  }, [error?.message, t]);

  const columns = useColumns(queueUuid ?? null, status ? statusUuid : null);
  useEffect(() => {
    if (!columns) {
      showSnackbar({
        kind: 'warning',
        title: t('notableConfig', 'No table configuration'),
        subtitle: t(
          'noTableConfigForQueueAndStatus',
          'No table configuration defined for queue: {{queue}} and status: {{status}}',
          { queue: queueUuid ?? 'any', status: status ? statusUuid : 'any' },
        ),
      });
    }
  }, [columns, queueUuid, status, statusUuid, t]);

  const filteredQueueEntries = useMemo(() => {
    const searchTermLowercase = searchTerm.toLowerCase();
    return queueEntries?.filter((queueEntry) => {
      return columns?.some((column) => {
        const columnSearchTerm = column.getFilterableValue?.(queueEntry)?.toLocaleLowerCase();
        return columnSearchTerm?.includes(searchTermLowercase);
      });
    });
  }, [columns, queueEntries, searchTerm]);

  // `totalCount` counts every matching entry on the server, which is not what a search leaves in the table.
  const shownCount = searchTerm ? (filteredQueueEntries?.length ?? 0) : totalCount;
  const title = status ? status.display : t('waitingList', 'Waiting list');

  const heading = (
    <div className={styles.headerContainer}>
      <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
        <h2>
          {isLoading || error
            ? title
            : status
              ? t('statusListWithCount', '{{status}} ({{count}})', { status: status.display, count: shownCount })
              : t('waitingListWithCount', 'Waiting list ({{count}})', { count: shownCount })}
        </h2>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        {heading}
        <DataTableSkeleton role="progressbar" />
      </>
    );
  }

  return (
    <>
      {heading}
      <QueueTable
        ExpandedRow={QueueTableExpandedRow}
        isValidating={isValidating}
        queueEntries={filteredQueueEntries ?? []}
        queueUuid={queueUuid ?? null}
        statusUuid={status ? statusUuid : null}
        tableFilters={
          <>
            {/* Adding a patient puts them in the waiting status, so the control only belongs on
                that table — not on Finished service, or any other status a deployment adds. */}
            {statusUuid === waitingStatusConceptUuid && <AddPatientToQueueButton />}
            <TableToolbarSearch
              className={styles.search}
              onChange={(e) => {
                if (typeof e === 'string') {
                  setSearchTerm(e);
                } else if (e && 'target' in e) {
                  const target = e.target as HTMLInputElement;
                  setSearchTerm(target.value);
                }
              }}
              placeholder={t('searchThisList', 'Search this list')}
              size={isDesktop(layout) ? 'sm' : 'lg'}
              persistent
            />
          </>
        }
      />
    </>
  );
}

export default DefaultQueueTable;
