import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTableSkeleton, Dropdown, Layer, TableToolbarSearch } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Add } from '@carbon/react/icons';
import {
  closeWorkspace,
  ExtensionSlot,
  isDesktop,
  launchWorkspace,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import { serviceQueuesPatientSearchWorkspace } from '../constants';
import { updateSelectedQueueStatus, useServiceQueuesStore } from '../store/store';
import { useColumns } from './cells/columns.resource';
import { useQueueEntries } from '../hooks/useQueueEntries';
import useQueueStatuses from '../hooks/useQueueStatuses';
import usePatientSearchVisibility from '../hooks/usePatientSearchVisibility';
import ClearQueueEntries from '../modals/clear-queue-entries-modal/clear-queue-entries.component';
import QueueTableExpandedRow from './queue-table-expanded-row.component';
import QueueTable from './queue-table.component';
import styles from './queue-table.scss';

function DefaultQueueTable() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedServiceUuid } = useServiceQueuesStore();
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  const { isPatientSearchOpen, hidePatientSearch, showPatientSearch } = usePatientSearchVisibility();

  const handleReturnToSearchList = useCallback(() => {
    showPatientSearch();
    closeWorkspace(serviceQueuesPatientSearchWorkspace);
  }, [showPatientSearch]);

  return (
    <div className={styles.defaultQueueTable}>
      <Layer className={styles.tableSection}>
        <div className={styles.headerContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('patientsCurrentlyInQueue', 'Patients currently in queue')}</h4>
          </div>
          <div className={styles.headerButtons}>
            {/**
             * Attaches the patient search button extension and overrides the default button props and passes some other state down which will eventually get passed to the patient search workspace upon clicking the button
             * https://github.com/openmrs/openmrs-esm-patient-management/blob/main/packages/esm-patient-search-app/src/patient-search-button/patient-search-button.component.tsx#L74
             * */}
            <ExtensionSlot
              name="patient-search-button-slot"
              state={{
                // Overrides the default button props for the patient search button
                buttonText: t('addPatientToQueue', 'Add patient to queue'),
                buttonProps: {
                  kind: 'secondary',
                  renderIcon: (props) => <Add size={16} {...props} />,
                  size: 'sm',
                },
                handleReturnToSearchList,
                hidePatientSearch,
                isOpen: isPatientSearchOpen,
                searchQuery: patientSearchQuery,
                searchQueryUpdatedAction: (searchQuery) => setPatientSearchQuery(searchQuery),
                selectPatientAction: (selectedPatientUuid) => {
                  hidePatientSearch();
                  launchWorkspace(serviceQueuesPatientSearchWorkspace, {
                    currentServiceQueueUuid: selectedServiceUuid,
                    handleReturnToSearchList,
                    selectedPatientUuid,
                  });
                },
                showPatientSearch,
                workspaceTitle: t('addPatientToQueue', 'Add patient to queue'),
              }}
            />
          </div>
        </div>
        <QueueTableSection />
      </Layer>
    </div>
  );
}

function QueueTableSection() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { selectedServiceUuid, selectedQueueLocationUuid, selectedQueueStatusUuid } = useServiceQueuesStore();
  const [searchTerm, setSearchTerm] = useState('');

  const searchCriteria = useMemo(() => {
    return {
      service: selectedServiceUuid,
      location: selectedQueueLocationUuid,
      isEnded: false,
      status: selectedQueueStatusUuid,
    };
  }, [selectedServiceUuid, selectedQueueLocationUuid, selectedQueueStatusUuid]);

  const { queueEntries, isLoading, error, isValidating } = useQueueEntries(searchCriteria);

  // When returning to this view via client-side navigation, force a refetch via the
  // existing event mechanism used by the data hook.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('queue-entry-updated'));
  }, []);

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
  if (!columns) {
    showSnackbar({
      kind: 'warning',
      title: t('notableConfig', 'No table configuration'),
      subtitle: 'No table configuration defined for queue: null and status: null',
    });
  }

  const filteredQueueEntries = useMemo(() => {
    const searchTermLowercase = searchTerm.toLowerCase();
    return queueEntries?.filter((queueEntry) => {
      return columns.some((column) => {
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
      isLoading={isLoading}
      isValidating={isValidating}
      queueEntries={filteredQueueEntries ?? []}
      queueUuid={null}
      statusUuid={null}
      tableFilters={
        <>
          <ClearQueueEntries queueEntries={filteredQueueEntries} />
          <StatusDropdownFilter />
          <TableToolbarSearch
            className={styles.search}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchThisList', 'Search this list')}
            size={isDesktop(layout) ? 'sm' : 'lg'}
            persistent
          />
        </>
      }
    />
  );
}

function StatusDropdownFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { statuses } = useQueueStatuses();
  const { selectedQueueStatusDisplay } = useServiceQueuesStore();
  const handleStatusChange = ({ selectedItem }) => {
    updateSelectedQueueStatus(selectedItem.uuid, selectedItem?.display);
  };

  return (
    <div className={styles.filterContainer}>
      <Dropdown
        id="statusFilter"
        items={[{ display: `${t('any', 'Any')}` }, ...(statuses ?? [])]}
        itemToString={(item) => (item ? item.display : '')}
        label={selectedQueueStatusDisplay ?? t('all', 'All')}
        onChange={handleStatusChange}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        titleText={t('showPatientsWithStatus', 'Show patients with status:')}
        type="inline"
      />
    </div>
  );
}

export default DefaultQueueTable;
