import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  Pagination,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tabs,
  Tile,
  type DataTableHeader,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  ConfigurableLink,
  ExtensionSlot,
  isDesktop,
  showModal,
  showSnackbar,
  useConfig,
  useFeatureFlag,
  useLayoutType,
  usePagination,
  useSession,
} from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueueRooms } from '../add-provider-queue-room/add-provider-queue-room.resource';
import ClearQueueEntries from '../clear-queue-entries-dialog/clear-queue-entries.component';
import { type ConfigObject } from '../config-schema';
import CurrentVisit from '../current-visit/current-visit-summary.component';
import { timeDiffInMinutes } from '../helpers/functions';
import {
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useIsPermanentProviderQueueRoom,
  useSelectedQueueLocationUuid,
  useSelectedServiceName,
  useSelectedServiceUuid,
} from '../helpers/helpers';
import { useQueues } from '../helpers/useQueues';
import { useQueueEntries } from '../hooks/useQueueEntries';
import PastVisit from '../past-visit/past-visit.component';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import PatientSearch from '../patient-search/patient-search.component';
import ActionsMenu from '../queue-entry-table-components/actions-menu.component';
import EditMenu from '../queue-entry-table-components/edit-entry.component';
import QueueDuration from '../queue-entry-table-components/queue-duration.component';
import QueuePriority from '../queue-entry-table-components/queue-priority.component';
import QueueStatus from '../queue-entry-table-components/queue-status.component';
import TransitionMenu from '../queue-entry-table-components/transition-entry.component';
import DefaultQueueTable from '../queue-table/default-queue-table.component';
import { type QueueEntry } from '../types';
import { mapVisitQueueEntryProperties, type MappedVisitQueueEntry } from './active-visits-table.resource';
import styles from './active-visits-table.scss';

/**
 * FIXME Temporarily moved here
 */
interface DataTableHeader {
  key: string;
  header: React.ReactNode;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface PaginationData {
  goTo: (page: number) => void;
  results: Array<MappedVisitQueueEntry>;
  currentPage: number;
}

function ActiveVisitsTable() {
  const selectedQueueUuid = useSelectedServiceUuid();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const { queueEntries, isLoading, error } = useQueueEntries({
    queue: selectedQueueUuid,
    location: currentLocationUuid,
    isEnded: false,
  });
  const useNewActiveVisitsTable = useFeatureFlag('new-queue-table');
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
  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  } else if (useNewActiveVisitsTable) {
    return <DefaultQueueTable queueEntries={queueEntries ?? []} />;
  } else {
    return <OldQueueTable queueEntries={queueEntries ?? []} />;
  }
}

// older implementation of the ActiveVisitsTable that we plan on deprecating
function OldQueueTable({ queueEntries }: { queueEntries: QueueEntry[] }) {
  const { t } = useTranslation();
  const currentServiceName = useSelectedServiceName();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { queues } = useQueues(currentQueueLocation);
  const { visitQueueNumberAttributeUuid } = useConfig<ConfigObject>();
  const visitQueueEntries = queueEntries.map((entry) =>
    mapVisitQueueEntryProperties(entry, visitQueueNumberAttributeUuid),
  );

  const currentServiceUuid = useSelectedServiceUuid();
  const [showOverlay, setShowOverlay] = useState(false);
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);
  const layout = useLayoutType();
  const { showQueueTableTab: useQueueTableTabs, customPatientChartUrl } = useConfig<ConfigObject>();
  const currentUserSession = useSession();
  const providerUuid = currentUserSession?.currentProvider?.uuid;
  const differenceInTime = timeDiffInMinutes(
    new Date(),
    new Date(localStorage.getItem('lastUpdatedQueueRoomTimestamp')),
  );
  const { queueLocations } = useQueueLocations();
  const { rooms, isLoading: loading } = useQueueRooms(queueLocations[0]?.id, currentServiceUuid);

  const isPermanentProviderQueueRoom = useIsPermanentProviderQueueRoom();
  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const [providerRoomModalShown, setProviderRoomModalShown] = useState(false);

  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  }: PaginationData = usePagination(visitQueueEntries, currentPageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('queueNumber', 'Queue Number'),
        key: 'queueNumber',
      },
      {
        id: 2,
        header: t('priority', 'Priority'),
        key: 'priority',
      },
      {
        id: 3,
        header: t('queueComingFrom', 'Coming from'),
        key: 'queueComingFrom',
      },
      {
        id: 4,
        header: t('status', 'Status'),
        key: 'status',
      },
      {
        id: 5,
        header: t('waitTime', 'Wait time'),
        key: 'waitTime',
      },
      {
        id: 6,
        header: t('actions', 'Actions'),
        key: 'actions',
      },
    ],
    [t],
  );

  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedServiceUuid(selectedItem.uuid);
    updateSelectedServiceName(selectedItem.display);
  };

  const tableRows = useMemo(() => {
    return paginatedQueueEntries?.map((entry) => ({
      ...entry,
      name: {
        content: (
          <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: entry.patientUuid }}>
            {entry.name}
          </ConfigurableLink>
        ),
      },
      queueNumber: {
        content: <span className={styles.statusContainer}>{entry?.visitQueueNumber}</span>,
      },
      priority: {
        content: <QueuePriority priority={entry.priority} priorityComment={entry.priorityComment} />,
      },
      queueComingFrom: {
        content: <span className={styles.statusContainer}>{entry?.queueComingFrom}</span>,
      },
      status: {
        content: <QueueStatus status={entry.status} queue={entry.queue} />,
      },
      waitTime: {
        content: <QueueDuration startedAt={entry.startedAt} endedAt={entry.endedAt} />,
      },
      actions: (
        <div className={styles.actionMenu}>
          <TransitionMenu queueEntry={entry} />
          <EditMenu queueEntry={entry} />
          <ActionsMenu queueEntry={entry} />
        </div>
      ),
    }));
  }, [paginatedQueueEntries]);

  const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        if (typeof filterableValue === 'boolean') {
          return false;
        }
        if (filterableValue.hasOwnProperty('content')) {
          if (Array.isArray(filterableValue.content.props.children)) {
            return ('' + filterableValue.content.props.children[1].props.children).toLowerCase().includes(filterTerm);
          }
          if (typeof filterableValue.content.props.children === 'object') {
            return ('' + filterableValue.content.props.children.props.children).toLowerCase().includes(filterTerm);
          }
          return ('' + filterableValue.content.props.children).toLowerCase().includes(filterTerm);
        }
        return ('' + filterableValue).toLowerCase().includes(filterTerm);
      }),
    );
  };

  const launchAddProviderRoomModal = useCallback(() => {
    const dispose = showModal('add-provider-to-room-modal', {
      closeModal: () => dispose(),
      providerUuid,
    });
    setProviderRoomModalShown(true);
  }, [providerUuid]);

  useEffect(() => {
    if (
      !loading &&
      rooms?.length > 0 &&
      differenceInTime >= 1 &&
      (isPermanentProviderQueueRoom == 'false' || isPermanentProviderQueueRoom === null) &&
      !providerRoomModalShown
    ) {
      launchAddProviderRoomModal();
    }
  }, [
    currentServiceUuid,
    rooms,
    providerRoomModalShown,
    loading,
    differenceInTime,
    isPermanentProviderQueueRoom,
    launchAddProviderRoomModal,
  ]);

  if (visitQueueEntries?.length) {
    return (
      <div className={styles.container}>
        {useQueueTableTabs === false ? (
          <>
            <div className={styles.headerBtnContainer}></div>
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
          </>
        ) : null}
        <DataTable
          data-floating-menu-container
          filterRows={handleFilter}
          headers={tableHeaders}
          overflowMenuOnHover={isDesktop(layout) ? true : false}
          rows={tableRows}
          size="sm"
          useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps, getToolbarProps, onInputChange }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                {...getToolbarProps()}
                style={{ position: 'static', height: '3rem', overflow: 'visible', backgroundColor: 'color' }}>
                <TableToolbarContent className={styles.toolbarContent}>
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
                  <TableToolbarSearch
                    className={styles.search}
                    onChange={onInputChange}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  />
                  <ClearQueueEntries visitQueueEntries={visitQueueEntries} />
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.activeVisitsTable}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                    <TableExpandHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedActiveVisitRow} colSpan={headers.length + 2}>
                            <>
                              <Tabs>
                                <TabList>
                                  <Tab>{t('currentVisit', 'Current visit')}</Tab>
                                  <Tab>{t('previousVisit', 'Previous visit')} </Tab>
                                </TabList>
                                <TabPanels>
                                  <TabPanel>
                                    <CurrentVisit
                                      patientUuid={tableRows?.[index]?.patientUuid}
                                      visitUuid={tableRows?.[index]?.visitUuid}
                                    />
                                  </TabPanel>
                                  <TabPanel>
                                    <PastVisit patientUuid={tableRows?.[index]?.patientUuid} />
                                  </TabPanel>
                                </TabPanels>
                              </Tabs>
                            </>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={() => setShowOverlay(true)}>
                      {t('addPatientToList', 'Add patient to list')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={visitQueueEntries?.length}
                className={styles.pagination}
                onChange={({ pageSize, page }) => {
                  if (pageSize !== currentPageSize) {
                    setPageSize(pageSize);
                  }
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
              />
            </TableContainer>
          )}
        </DataTable>
        {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} viewState={viewState} />}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {useQueueTableTabs === false ? (
        <>
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
        </>
      ) : null}
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
          <div className={styles.tileContent}>
            <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
            <ExtensionSlot
              name="patient-search-button-slot"
              state={{
                buttonText: t('addPatientToQueue', 'Add patient to queue'),
                overlayHeader: t('addPatientToQueue', 'Add patient to queue'),
                buttonProps: {
                  kind: 'ghost',
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
        </Tile>
      </div>
      {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} viewState={viewState} />}
    </div>
  );
}

export default ActiveVisitsTable;
