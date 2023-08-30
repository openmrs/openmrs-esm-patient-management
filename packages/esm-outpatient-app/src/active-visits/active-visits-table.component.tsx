import React, { useMemo, useState, MouseEvent, AnchorHTMLAttributes, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
  DataTableSkeleton,
  DefinitionTooltip,
  Dropdown,
  Layer,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tabs,
  TabPanels,
  TabPanel,
  TabList,
  Tag,
  Tile,
  Pagination,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  useLayoutType,
  navigate,
  interpolateUrl,
  isDesktop,
  ExtensionSlot,
  usePagination,
  useConfig,
  ConfigObject,
  useSession,
  showModal,
} from '@openmrs/esm-framework';
import {
  useVisitQueueEntries,
  useServices,
  getOriginFromPathName,
  MappedVisitQueueEntry,
} from './active-visits-table.resource';
import { SearchTypes } from '../types';
import {
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedServiceName,
  useSelectedQueueLocationUuid,
  useIsPermanentProviderQueueRoom,
  useSelectedServiceUuid,
} from '../helpers/helpers';
import { buildStatusString, formatWaitTime, getTagType, timeDiffInMinutes } from '../helpers/functions';
import { useQueueRooms } from '../add-provider-queue-room/add-provider-queue-room.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import ActionsMenu from '../queue-entry-table-components/actions-menu.component';
import ClearQueueEntries from '../clear-queue-entries-dialog/clear-queue-entries.component';
import CurrentVisit from '../current-visit/current-visit-summary.component';
import EditMenu from '../queue-entry-table-components/edit-entry.component';
import OpenChartMenu from '../queue-entry-table-components/open-chart.component';
import PatientSearch from '../patient-search/patient-search.component';
import PastVisit from '../past-visit/past-visit.component';
import StatusIcon from '../queue-entry-table-components/status-icon.component';
import TransitionMenu from '../queue-entry-table-components/transition-entry.component';
import styles from './active-visits-table.scss';

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface NameLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  from: string;
}

interface PaginationData {
  goTo: (page: number) => void;
  results: Array<MappedVisitQueueEntry>;
  currentPage: number;
}

const PatientNameLink: React.FC<NameLinkProps> = ({ from, to, children }) => {
  const handleNameClick = (event: MouseEvent, to: string) => {
    event.preventDefault();
    navigate({ to });
    localStorage.setItem('fromPage', from);
  };
  return (
    <a onClick={(e) => handleNameClick(e, to)} href={interpolateUrl(to)}>
      {children}
    </a>
  );
};

function ActiveVisitsTable() {
  const { t } = useTranslation();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { services } = useServices(currentQueueLocation);
  const currentServiceName = useSelectedServiceName();
  const currentLocationUuid = useSelectedQueueLocationUuid();
  const currentServiceUuid = useSelectedServiceUuid();
  const { visitQueueEntries, isLoading } = useVisitQueueEntries(currentServiceName, currentLocationUuid);
  const [showOverlay, setShowOverlay] = useState(false);
  const [view, setView] = useState('');
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);
  const layout = useLayoutType();
  const config = useConfig() as ConfigObject;
  const useQueueTableTabs = config.showQueueTableTab;
  const currentUserSession = useSession();
  const providerUuid = currentUserSession?.currentProvider?.uuid;
  const differenceInTime = timeDiffInMinutes(
    new Date(),
    new Date(localStorage.getItem('lastUpdatedQueueRoomTimestamp')),
  );
  const { queueLocations } = useQueueLocations();
  const { rooms, isLoading: loading } = useQueueRooms(queueLocations[0]?.id, currentServiceUuid);

  const isPermanentProviderQueueRoom = useIsPermanentProviderQueueRoom();
  const currentPathName: string = window.location.pathname;
  const fromPage: string = getOriginFromPathName(currentPathName);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const [overlayHeader, setOverlayTitle] = useState('');
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
        header: t('queueNumber', 'QueueNumber'),
        key: 'queueNumber',
      },
      {
        id: 2,
        header: t('priority', 'Priority'),
        key: 'priority',
      },
      {
        id: 3,
        header: t('locationComingFrom', 'Coming from'),
        key: 'locationComingFrom',
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
          <PatientNameLink to={`\${openmrsSpaBase}/patient/${entry.patientUuid}/chart`} from={fromPage}>
            {entry.name}
          </PatientNameLink>
        ),
      },
      queueNumber: {
        content: <span className={styles.statusContainer}>{entry?.visitQueueNumber}</span>,
      },
      priority: {
        content: (
          <>
            {entry?.priorityComment ? (
              <DefinitionTooltip className={styles.tooltip} align="bottom-left" definition={entry.priorityComment}>
                <Tag
                  role="tooltip"
                  className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                  type={getTagType(entry.priority as string)}>
                  {entry.priority}
                </Tag>
              </DefinitionTooltip>
            ) : (
              <Tag
                className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                type={getTagType(entry.priority as string)}>
                {entry.priority}
              </Tag>
            )}
          </>
        ),
      },
      locationComingFrom: {
        content: <span className={styles.statusContainer}>{entry?.locationComingFrom}</span>,
      },
      status: {
        content: (
          <span className={styles.statusContainer}>
            <StatusIcon status={entry.status.toLowerCase()} />
            <span>{buildStatusString(entry.status.toLowerCase(), entry.service)}</span>
          </span>
        ),
      },
      waitTime: {
        content: <span className={styles.statusContainer}>{formatWaitTime(entry.waitTime, t)}</span>,
      },
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

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

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
                      setView(SearchTypes.SCHEDULED_VISITS);
                      setViewState({ selectedPatientUuid });
                      setOverlayTitle(t('addPatientWithAppointmentToQueue', 'Add patient with appointment to queue'));
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
          size="xs"
          useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{ position: 'static', height: '3rem', overflow: 'visible', backgroundColor: 'color' }}>
                <TableToolbarContent className={styles.toolbarContent}>
                  <div className={styles.filterContainer}>
                    <Dropdown
                      id="serviceFilter"
                      titleText={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
                      label={currentServiceName}
                      type="inline"
                      items={[{ display: `${t('all', 'All')}` }, ...services]}
                      itemToString={(item) => (item ? item.display : '')}
                      onChange={handleServiceChange}
                      size="sm"
                    />
                  </div>
                  <Layer>
                    <TableToolbarSearch
                      className={styles.search}
                      onChange={onInputChange}
                      placeholder={t('searchThisList', 'Search this list')}
                      size="sm"
                    />
                  </Layer>
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
                          <TableCell className="cds--table-column-menu">
                            <TransitionMenu queueEntry={visitQueueEntries?.[index]} closeModal={() => true} />
                          </TableCell>
                          <TableCell className="cds--table-column-menu">
                            <EditMenu queueEntry={visitQueueEntries?.[index]} closeModal={() => true} />
                          </TableCell>
                          <TableCell className="cds--table-column-menu">
                            <OpenChartMenu patientUuid={visitQueueEntries?.[index]?.patientUuid} />
                          </TableCell>
                          <TableCell className="cds--table-column-menu">
                            <ActionsMenu queueEntry={visitQueueEntries?.[index]} closeModal={() => true} />
                          </TableCell>
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
        {showOverlay && (
          <PatientSearch
            view={view}
            closePanel={() => setShowOverlay(false)}
            viewState={{
              selectedPatientUuid: viewState.selectedPatientUuid,
            }}
            headerTitle={overlayHeader}
          />
        )}
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
                    setView(SearchTypes.SCHEDULED_VISITS);
                    setViewState({ selectedPatientUuid });
                    setOverlayTitle(t('addPatientWithAppointmentToQueue', 'Add patient with appointment to queue'));
                  },
                }}
              />
            </div>
          </div>
        </>
      ) : null}
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
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
                setView(SearchTypes.SCHEDULED_VISITS);
                setViewState({ selectedPatientUuid });
                setOverlayTitle(t('addPatientWithAppointmentToQueue', 'Add patient with appointment to queue'));
              },
            }}
          />
        </Tile>
      </div>
      {showOverlay && (
        <PatientSearch
          view={view}
          closePanel={() => setShowOverlay(false)}
          viewState={viewState}
          headerTitle={overlayHeader}
        />
      )}
    </div>
  );
}

export default ActiveVisitsTable;
