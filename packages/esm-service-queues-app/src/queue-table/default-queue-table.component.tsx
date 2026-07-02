import React, { useEffect, useMemo, useState } from 'react';
import { DataTableSkeleton, Layer, TableToolbarSearch } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { isDesktop, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { useServiceQueuesStore } from '../store/store';
import { useColumns } from './cells/columns.resource';
import { useQueueEntries } from '../hooks/useQueueEntries';
import AddPatientToQueueButton from './components/add-patient-to-queue-button.component';
import ClearQueueEntries from '../modals/clear-queue-entries-modal/clear-queue-entries.component';
import QueueTable from './queue-table.component';
import QueueTableExpandedRow from './queue-table-expanded-row.component';
import { type ConfigObject } from '../config-schema';
import styles from './queue-table.scss';

function DefaultQueueTable() {
  return (
    <div className={styles.defaultQueueTable}>
      <Layer className={styles.tableSection}>
        <QueueTableSection />
      </Layer>
    </div>
  );
}

function QueueTableSection() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const {
    concepts: { defaultStatusConceptUuid },
  } = useConfig<ConfigObject>();
  const [searchTerm, setSearchTerm] = useState('');

  // Waiting list shows only waiting patients; in-service ones live in the Attending cards.
  const searchCriteria = useMemo(() => {
    return {
      service: selectedServiceUuid,
      location: selectedQueueLocationUuid,
      isEnded: false,
      status: defaultStatusConceptUuid,
    };
  }, [selectedServiceUuid, selectedQueueLocationUuid, defaultStatusConceptUuid]);

  const { queueEntries, isLoading, error, isValidating } = useQueueEntries(searchCriteria);

  useEffect(() => {
    if (error?.message) {
      showSnackbar({
        title: t('errorLoadingQueueEntries', 'Error loading queue entries'),
        kind: 'error',
        subtitle: error?.message,
      });
    }
  }, [error?.message, t]);

  const columns = useColumns(null, null);
  useEffect(() => {
    if (!columns) {
      showSnackbar({
        kind: 'warning',
        title: t('notableConfig', 'No table configuration'),
        subtitle: 'No table configuration defined for queue: null and status: null',
      });
    }
  }, [columns, t]);

  const filteredQueueEntries = useMemo(() => {
    const searchTermLowercase = searchTerm.toLowerCase();
    return queueEntries?.filter((queueEntry) => {
      return columns?.some((column) => {
        const columnSearchTerm = column.getFilterableValue?.(queueEntry)?.toLocaleLowerCase();
        return columnSearchTerm?.includes(searchTermLowercase);
      });
    });
  }, [columns, queueEntries, searchTerm]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <QueueTable
      ExpandedRow={QueueTableExpandedRow}
      isValidating={isValidating}
      queueEntries={filteredQueueEntries ?? []}
      queueUuid={null}
      statusUuid={null}
      tableFilters={
        <>
          {filteredQueueEntries?.length > 0 && <ClearQueueEntries queueEntries={filteredQueueEntries} />}
          <AddPatientToQueueButton />
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
  );
}

export default DefaultQueueTable;
