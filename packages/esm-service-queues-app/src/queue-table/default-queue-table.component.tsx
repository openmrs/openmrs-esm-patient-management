import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTableSkeleton, Dropdown, TableToolbarSearch } from '@carbon/react';
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

const serviceQueuesPatientSearchWorkspace = 'service-queues-patient-search';

/*
Component with default values / sub-components passed into the more generic QueueTable.
This is used in the main dashboard of the queues app. (Currently behind a feature flag)
*/
function DefaultQueueTable() {
  const selectedService = useSelectedService();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const selectedQueueStatus = useSelectedQueueStatus();
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

  const [isPatientSearchOpen, setIsPatientSearchOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');

  const handleBackToSearchList = useCallback(() => {
    setIsPatientSearchOpen(true);
    closeWorkspace(serviceQueuesPatientSearchWorkspace);
  }, []);

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
              isOpen: isPatientSearchOpen,
              searchQuery: patientSearchQuery,
              buttonText: t('addPatientToQueue', 'Add patient to queue'),
              overlayHeader: t('addPatientToQueue', 'Add patient to queue'),
              buttonProps: {
                kind: 'secondary',
                renderIcon: (props) => <Add size={16} {...props} />,
                size: 'sm',
              },
              searchQueryUpdatedAction: (searchQuery: string) => {
                setPatientSearchQuery(searchQuery);
              },
              selectPatientAction: (selectedPatientUuid: string) => {
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
      {!isLoading ? (
        <div className={styles.paddedQueueTable}>
          <QueueTable
            queueEntries={filteredQueueEntries ?? []}
            isValidating={isValidating}
            queueUuid={null}
            statusUuid={null}
            ExpandedRow={QueueTableExpandedRow}
            tableFilter={[
              <QueueDropdownFilter />,
              <StatusDropdownFilter />,
              <TableToolbarSearch
                className={styles.search}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchThisList', 'Search this list')}
                size={isDesktop(layout) ? 'sm' : 'lg'}
              />,
              <ClearQueueEntries queueEntries={filteredQueueEntries} />,
            ]}
          />
        </div>
      ) : (
        <DataTableSkeleton role="progressbar" />
      )}
    </div>
  );
}

function QueueDropdownFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { services } = useQueueServices();
  const selectedService = useSelectedService();
  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedService(selectedItem.uuid, selectedItem?.display);
  };

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="serviceFilter"
          titleText={t('filterByService', 'Filter by service :')}
          label={selectedService?.serviceDisplay ?? t('all', 'All')}
          type="inline"
          items={[{ display: `${t('all', 'All')}` }, ...(services ?? [])]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handleServiceChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
      </div>
    </>
  );
}

function StatusDropdownFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { statuses } = useQueueStatuses();
  const queueStatus = useSelectedQueueStatus();
  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedQueueStatus(selectedItem.uuid, selectedItem?.display);
  };

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="statusFilter"
          titleText={t('filterByStatus', 'Filter by status :')}
          label={queueStatus?.statusDisplay ?? t('all', 'All')}
          type="inline"
          items={[{ display: `${t('all', 'All')}` }, ...(statuses ?? [])]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handleServiceChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
      </div>
    </>
  );
}

export default DefaultQueueTable;
