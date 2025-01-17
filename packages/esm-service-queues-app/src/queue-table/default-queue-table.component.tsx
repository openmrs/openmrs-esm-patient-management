import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTableSkeleton, Dropdown, Layer, TableToolbarSearch } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  closeWorkspace,
  ExtensionSlot,
  isDesktop,
  launchWorkspace,
  showSnackbar,
  showToast,
  useLayoutType,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import {
  updateSelectedQueueStatus,
  updateSelectedService,
  useSelectedQueueLocationUuid,
  useSelectedQueueStatus,
  useSelectedService,
} from '../helpers/helpers';
import { useColumns } from './cells/columns.resource';
import { useQueueEntries } from '../hooks/useQueueEntries';
import useQueueStatuses from '../hooks/useQueueStatuses';
import useQueueServices from '../hooks/useQueueService';
import ClearQueueEntries from '../clear-queue-entries-dialog/clear-queue-entries.component';
import QueueTableExpandedRow from './queue-table-expanded-row.component';
import QueueTable from './queue-table.component';
import styles from './queue-table.scss';

const serviceQueuesPatientSearchWorkspace = 'create-queue-entry-workspace';

function DefaultQueuePage() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const selectedService = useSelectedService();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const selectedQueueStatus = useSelectedQueueStatus();
  const [isPatientSearchOpen, setIsPatientSearchOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  const handleBackToSearchList = useCallback(() => {
    setIsPatientSearchOpen(true);
    closeWorkspace(serviceQueuesPatientSearchWorkspace);
  }, []);

  return (
    <div className={styles.defaultQueuePage}>
      <Layer className={styles.tableSection}>
        <div className={styles.headerContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('patientsCurrentlyInQueue', 'Patients currently in queue')}</h4>
          </div>
          <div className={styles.headerButtons}>
            <ExtensionSlot
              name="patient-search-button-slot"
              state={{
                isOpen: isPatientSearchOpen,
                searchQuery: patientSearchQuery,
                buttonText: t('addPatientToQueue', 'Add patient to queue'),
                overlayHeader: t('addPatientToQueue', 'Add patient to queue'),
                buttonProps: {
                  kind: 'secondary',
                  renderIcon: (props) => <Add size={16} {...props} />,
                  size: 'sm',
                },
                searchQueryUpdatedAction: (searchQuery) => {
                  setPatientSearchQuery(searchQuery);
                },
                selectPatientAction: (selectedPatientUuid) => {
                  setIsPatientSearchOpen(false);
                  launchWorkspace(serviceQueuesPatientSearchWorkspace, {
                    selectedPatientUuid,
                    currentServiceQueueUuid: selectedService?.serviceUuid,
                    handleBackToSearchList,
                  });
                },
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
  const selectedService = useSelectedService();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const selectedQueueStatus = useSelectedQueueStatus();
  const [searchTerm, setSearchTerm] = useState('');

  const searchCriteria = useMemo(
    () => ({
      service: selectedService?.serviceUuid,
      location: currentLocationUuid,
      isEnded: false,
      status: selectedQueueStatus?.statusUuid,
    }),
    [selectedService?.serviceUuid, currentLocationUuid, selectedQueueStatus?.statusUuid],
  );

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
  if (!columns) {
    showToast({
      title: t('notableConfig', 'No table configuration'),
      kind: 'warning',
      description: 'No table configuration defined for queue: null and status: null',
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

  return !isLoading ? (
    <QueueTable
      queueEntries={filteredQueueEntries ?? []}
      isValidating={isValidating}
      queueUuid={null}
      statusUuid={null}
      ExpandedRow={QueueTableExpandedRow}
      tableFilters={
        <>
          <QueueDropdownFilter /> <StatusDropdownFilter />
          <TableToolbarSearch
            className={styles.search}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchThisList', 'Search this list')}
            size={isDesktop(layout) ? 'sm' : 'lg'}
          />
          <ClearQueueEntries queueEntries={filteredQueueEntries} />
        </>
      }
    />
  ) : (
    <DataTableSkeleton role="progressbar" />
  );
}

function QueueDropdownFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { services } = useQueueServices();
  const selectedService = useSelectedService();

  const handleServiceChange = useCallback(({ selectedItem }) => {
    updateSelectedService(selectedItem.uuid, selectedItem?.display);
  }, []);

  return (
    <div className={styles.filterContainer}>
      <Dropdown
        id="serviceFilter"
        items={[{ display: `${t('all', 'All')}` }, ...(services ?? [])]}
        itemToString={(item) => (item ? item.display : '')}
        label={selectedService?.serviceDisplay ?? t('all', 'All')}
        onChange={handleServiceChange}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        titleText={t('filterByService', 'Filter by service:')}
        type="inline"
      />
    </div>
  );
}

function StatusDropdownFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { statuses } = useQueueStatuses();
  const queueStatus = useSelectedQueueStatus();
  const handleStatusChange = ({ selectedItem }) => {
    updateSelectedQueueStatus(selectedItem.uuid, selectedItem?.display);
  };

  return (
    <div className={styles.filterContainer}>
      <Dropdown
        id="statusFilter"
        items={[{ display: `${t('all', 'All')}` }, ...(statuses ?? [])]}
        itemToString={(item) => (item ? item.display : '')}
        label={queueStatus?.statusDisplay ?? t('all', 'All')}
        onChange={handleStatusChange}
        size={isDesktop(layout) ? 'sm' : 'lg'}
        titleText={t('filterByStatus', 'Filter by status:')}
        type="inline"
      />
    </div>
  );
}

export default DefaultQueuePage;
