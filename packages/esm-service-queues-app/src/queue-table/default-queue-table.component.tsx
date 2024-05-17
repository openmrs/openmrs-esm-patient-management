import React, { useEffect, useMemo, useState } from 'react';
import { DataTableSkeleton, Dropdown, TableToolbarSearch, Popover, PopoverContent, Button } from '@carbon/react';
import { Add, Filter } from '@carbon/react/icons';
import { ExtensionSlot, isDesktop, showSnackbar, showToast, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import ClearQueueEntries from '../clear-queue-entries-dialog/clear-queue-entries.component';
import {
  updateSelectedQueuePriority,
  updateSelectedQueueStatus,
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedPriority,
  useSelectedQueueLocationUuid,
  useSelectedServiceName,
  useSelectedServiceUuid,
  useSelectedStatus,
} from '../helpers/helpers';
import { useQueues } from '../hooks/useQueues';
import { useQueueEntries } from '../hooks/useQueueEntries';
import PatientSearch from '../patient-search/patient-search.component';
import QueueTableExpandedRow from './queue-table-expanded-row.component';
import QueueTable from './queue-table.component';
import styles from './queue-table.scss';
import { useColumns } from './cells/columns.resource';
import { Concept } from '../types';
import { useServiceConcepts } from '../queue-services/queue-service.resource';
import { useQueue } from '../hooks/useQueue';
import { useQueuePriorities } from '../hooks/useQueuePriorities';
import { useQueueStatuses } from '../hooks/useQueueStatus';
import classNames from 'classnames';
import { ButtonSet } from '@carbon/react';
import { QueueFilterPopOver, QueueLocationFilter } from './default-queue-table-filter.component';

/*
Component with default values / sub-components passed into the more generic QueueTable.
This is used in the main dashboard of the queues app. (Currently behind a feature flag)
*/
function DefaultQueueTable() {
  const selectedQueueUuid = useSelectedServiceUuid();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const { priorityUuid } = useSelectedPriority();
  const { statusUuid } = useSelectedStatus();
  const { queueEntries, isLoading, error } = useQueueEntries({
    queue: selectedQueueUuid,
    location: currentLocationUuid,
    isEnded: false,
    priority: priorityUuid,
    status: statusUuid,
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (error?.message) {
      showSnackbar({
        title: t('errorLoadingQueueEntries', 'Error loading queue entries'),
        kind: 'error',
        subtitle: error?.message,
      });
    }
  }, [error?.message]);
  const layout = useLayoutType();

  const [showOverlay, setShowOverlay] = useState(false);
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);

  const columns = useColumns(null, null);
  if (!columns) {
    showToast({
      title: t('notableConfig', 'No table configuration'),
      kind: 'warning',
      description: 'No table configuration defined for queue: null and status: null',
    });
  }

  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueueEntries = useMemo(() => {
    const searchTermLowercase = searchTerm.toLowerCase();
    return queueEntries?.filter((queueEntry) => {
      return columns.some((column) => {
        const columnSearchTerm = column.getFilterableValue?.(queueEntry)?.toLocaleLowerCase();
        return columnSearchTerm?.includes(searchTermLowercase);
      });
    });
  }, [queueEntries, searchTerm]);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('patientsCurrentlyInQueue', 'Patients currently in queue')}</h4>
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
        </div>
      </div>
      {isLoading ? (
        <DataTableSkeleton role="progressbar" showHeader={false} />
      ) : (
        <QueueTable
          queueEntries={filteredQueueEntries ?? []}
          queueUuid={null}
          statusUuid={null}
          ExpandedRow={QueueTableExpandedRow}
          tableFilter={[
            <QueueLocationFilter />,
            <QueueFilterPopOver />,

            <TableToolbarSearch
              className={styles.search}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchThisList', 'Search this list')}
              size={isDesktop(layout) ? 'sm' : 'lg'}
            />,
            <ClearQueueEntries queueEntries={filteredQueueEntries} />,
          ]}
        />
      )}
      {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} viewState={viewState} />}
    </div>
  );
}

export default DefaultQueueTable;
