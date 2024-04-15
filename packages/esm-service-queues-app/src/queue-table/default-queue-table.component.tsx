import { Dropdown, TableToolbarSearch } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../active-visits/active-visits-table.scss';
import {
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedQueueLocationUuid,
  useSelectedServiceName,
} from '../helpers/helpers';
import { useQueues } from '../helpers/useQueues';
import PatientSearch from '../patient-search/patient-search.component';
import { type QueueEntry } from '../types';
import { queueTableActionColumn } from './cells/queue-table-action-cell.component';
import { queueTableComingFromColumn } from './cells/queue-table-coming-from-cell.component';
import { queueTableNameColumn } from './cells/queue-table-name-cell.component';
import { queueTablePriorityColumn } from './cells/queue-table-priority-cell.component';
import { queueTableQueueColumn } from './cells/queue-table-queue-cell.component';
import { queueTableStatusColumn } from './cells/queue-table-status-cell.component';
import { queueTableWaitTimeColumn } from './cells/queue-table-wait-time-cell.component';
import QueueTableExpandedRow from './queue-table-expanded-row.component';
import QueueTable from './queue-table.component';

/*
Component with default values / sub-components passed into the more generic QueueTable.
This is used in the main dashboard of the queues app. (Currently behind a feature flag)
*/
function DefaultQueueTable({ queueEntries }: { queueEntries: QueueEntry[] }) {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const [showOverlay, setShowOverlay] = useState(false);
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);

  const columns = [
    queueTableNameColumn,
    queueTablePriorityColumn,
    queueTableComingFromColumn,
    queueTableStatusColumn,
    queueTableQueueColumn,
    queueTableWaitTimeColumn,
    queueTableActionColumn,
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredQueueEntries = useMemo(() => {
    const searchTermLowercase = searchTerm.toLowerCase();
    return queueEntries.filter((queueEntry) => {
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
