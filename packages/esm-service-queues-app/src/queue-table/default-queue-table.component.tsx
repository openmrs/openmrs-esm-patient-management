import { Dropdown, TableToolbarSearch } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot, isDesktop, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './queue-table.scss';
import {
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedQueueLocationUuid,
  useSelectedServiceName,
  useSelectedServiceUuid,
} from '../helpers/helpers';
import { useQueues } from '../helpers/useQueues';
import PatientSearch from '../patient-search/patient-search.component';
import { queueTableActionColumn } from './cells/queue-table-action-cell.component';
import { queueTableComingFromColumn } from './cells/queue-table-coming-from-cell.component';
import { queueTableNameColumn } from './cells/queue-table-name-cell.component';
import { queueTablePriorityColumn } from './cells/queue-table-priority-cell.component';
import { queueTableQueueColumn } from './cells/queue-table-queue-cell.component';
import { queueTableStatusColumn } from './cells/queue-table-status-cell.component';
import { queueTableWaitTimeColumn } from './cells/queue-table-wait-time-cell.component';
import QueueTableExpandedRow from './queue-table-expanded-row.component';
import QueueTable from './queue-table.component';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { DataTableSkeleton } from '@carbon/react';
import { type ConfigObject } from '../config-schema';
import { queueTableVisitAttributeQueueNumberColumn } from './cells/queue-table-visit-attribute-queue-number-cell.component';
import { activeVisitActionsColumn } from '../active-visits/active-visits-row-actions.component';
import { useShowProviderQueueRoomModal } from '../add-provider-queue-room/add-provider-queue-room.resource';
import ClearQueueEntries from '../clear-queue-entries-dialog/clear-queue-entries.component';

/*
Component with default values / sub-components passed into the more generic QueueTable.
This is used in the main dashboard of the queues app. (Currently behind a feature flag)
*/
function DefaultQueueTable() {
  const selectedQueueUuid = useSelectedServiceUuid();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const { queueEntries, isLoading, error } = useQueueEntries({
    queue: selectedQueueUuid,
    location: currentLocationUuid,
    isEnded: false,
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

  useShowProviderQueueRoomModal();

  const config = useConfig<ConfigObject>();
  const { visitQueueNumberAttributeUuid, concepts } = config;

  // TODO: these two configs are here for backwards compatibility with the actions we show in each row.
  // There might be futher changes pending future design of the config schema.
  const { defaultStatusConceptUuid, defaultTransitionStatus } = concepts ?? ({} as any);

  const columns = [
    queueTableNameColumn,
    ...(visitQueueNumberAttributeUuid ? [queueTableVisitAttributeQueueNumberColumn] : []),
    queueTablePriorityColumn,
    queueTableComingFromColumn,
    queueTableStatusColumn,
    queueTableQueueColumn,
    queueTableWaitTimeColumn,
    defaultStatusConceptUuid && defaultTransitionStatus ? activeVisitActionsColumn : queueTableActionColumn,
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueueEntries = useMemo(() => {
    const searchTermLowercase = searchTerm.toLowerCase();
    return queueEntries?.filter((queueEntry) => {
      return columns.some((column) => {
        const columnSearchTerm = column.getFilterableValue?.(queueEntry, config)?.toLocaleLowerCase();
        return columnSearchTerm?.includes(searchTermLowercase);
      });
    });
  }, [queueEntries, searchTerm]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

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
      <QueueTable
        queueEntries={filteredQueueEntries ?? []}
        queueTableColumns={columns}
        ExpandedRow={QueueTableExpandedRow}
        tableFilter={[
          <QueueDropdownFilter />,
          <TableToolbarSearch
            className={styles.search}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchThisList', 'Search this list')}
            size="sm"
          />,
          <ClearQueueEntries queueEntries={filteredQueueEntries} />,
        ]}
      />
      {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} viewState={viewState} />}
    </div>
  );
}

function QueueDropdownFilter() {
  const { t } = useTranslation();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { queues } = useQueues(currentQueueLocation);
  const currentServiceName = useSelectedServiceName();
  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedServiceUuid(selectedItem.uuid);
    updateSelectedServiceName(selectedItem.display);
  };

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="serviceFilter"
          titleText={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
          label={currentServiceName}
          type="inline"
          items={[{ display: `${t('all', 'All')}` }, ...queues]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handleServiceChange}
          size="sm"
        />
      </div>
    </>
  );
}

export default DefaultQueueTable;
