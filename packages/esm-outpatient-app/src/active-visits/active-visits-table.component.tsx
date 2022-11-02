import React, { useEffect, useMemo, useState, useCallback, MouseEvent, AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
  DataTableSkeleton,
  DefinitionTooltip,
  Dropdown,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
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
} from '@carbon/react';
import { Add, ArrowRight, Edit, Group, InProgress } from '@carbon/react/icons';
import {
  useLayoutType,
  navigate,
  showModal,
  interpolateUrl,
  isDesktop,
  useSession,
  useLocations,
} from '@openmrs/esm-framework';
import {
  useVisitQueueEntries,
  useServices,
  QueueService,
  QueueStatus,
  MappedVisitQueueEntry,
  MappedQueuePriority,
  getOriginFromPathName,
} from './active-visits-table.resource';
import CurrentVisit from '../current-visit/current-visit-summary.component';
import PatientSearch from '../patient-search/patient-search.component';
import PastVisit from '../past-visit/past-visit.component';
import styles from './active-visits-table.scss';
import first from 'lodash-es/first';
import { SearchTypes } from '../types';
import ClearQueueEntries from '../clear-queue-entries-dialog/clear-queue-entries.component';

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

function ActionsMenu({ queueEntry }: { queueEntry: MappedVisitQueueEntry }) {
  const { t } = useTranslation();

  const launchEndVisitModal = useCallback(() => {
    const dispose = showModal('remove-queue-entry', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Layer>
      <OverflowMenu ariaLabel="Actions menu" selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#editPatientDetails"
          itemText={t('editPatientDetails', 'Edit patient details')}
          onClick={() =>
            navigate({
              to: `\${openmrsSpaBase}/patient/${queueEntry.patientUuid}/edit`,
            })
          }>
          {t('editPatientDetails', 'Edit patient details')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#endVisit"
          onClick={launchEndVisitModal}
          hasDivider
          isDelete
          itemText={t('endVisit', 'End visit')}>
          {t('endVisit', 'End Visit')}
        </OverflowMenuItem>
      </OverflowMenu>
    </Layer>
  );
}

function EditMenu({ queueEntry }: { queueEntry: MappedVisitQueueEntry }) {
  const { t } = useTranslation();
  const launchEditPriorityModal = useCallback(() => {
    const dispose = showModal('edit-queue-entry-status-modal', {
      closeModal: () => dispose(),
      queueEntry,
    });
  }, [queueEntry]);

  return (
    <Button
      kind="ghost"
      onClick={launchEditPriorityModal}
      iconDescription={t('editQueueEntryStatusTooltip', 'Edit')}
      className={styles.editStatusBtn}
      hasIconOnly
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
}

function StatusIcon({ status }) {
  switch (status as QueueStatus) {
    case 'Waiting':
      return <InProgress size={16} />;
    case 'In Service':
      return <Group size={16} />;
    case 'Finished Service':
      return <Group size={16} />;
    default:
      return null;
  }
}

function ActiveVisitsTable() {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState('');
  const session = useSession();
  const locations = useLocations();
  const { services } = useServices(userLocation);
  const { visitQueueEntries, isLoading } = useVisitQueueEntries();
  const [filteredRows, setFilteredRows] = useState<Array<MappedVisitQueueEntry>>([]);
  const [allEntries, setAllEntries] = useState(true);
  const [filter, setFilter] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [view, setView] = useState('');
  const layout = useLayoutType();

  const currentPathName: string = window.location.pathname;
  const fromPage: string = getOriginFromPathName(currentPathName);

  useEffect(() => {
    if (!userLocation && session?.sessionLocation !== null) {
      setUserLocation(session?.sessionLocation?.uuid);
    } else if (!userLocation && locations) {
      setUserLocation(first(locations)?.uuid);
    }
  }, [session, locations, userLocation]);

  useEffect(() => {
    if (filter) {
      if (filter === 'All') {
        setFilteredRows(visitQueueEntries);
        setFilter('');
        setAllEntries(true);
      } else {
        setFilteredRows(
          visitQueueEntries?.filter((entry) => entry.service === filter && /waiting/i.exec(entry.status)),
        );
        setFilter('');
        setAllEntries(false);
      }
    }
  }, [filter, filteredRows, visitQueueEntries]);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('priority', 'Priority'),
        key: 'priority',
      },
      {
        id: 2,
        header: t('status', 'Status'),
        key: 'status',
      },
      {
        id: 3,
        header: t('waitTime', 'Wait time'),
        key: 'waitTime',
      },
    ],
    [t],
  );

  const getTagType = (priority: string) => {
    switch (priority as MappedQueuePriority) {
      case 'Emergency':
        return 'red';
      case 'Not Urgent':
        return 'green';
      default:
        return 'gray';
    }
  };

  const buildStatusString = (status: QueueStatus, service: QueueService) => {
    if (!status || !service) {
      return '';
    }

    if (status === 'Waiting') {
      return `${status} for ${service}`;
    } else if (status === 'In Service') {
      return `Attending ${service}`;
    } else if (status === 'Finished Service') {
      return `Finished ${service}`;
    }
  };

  const formatWaitTime = (waitTime: string) => {
    const num = parseInt(waitTime);
    const hours = num / 60;
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);
    if (rhours > 0) {
      return rhours + ' ' + `${t('hoursAnd', 'hours and ')}` + rminutes + ' ' + `${t('minutes', 'minutes')}`;
    } else {
      return rminutes + ' ' + `${t('minutes', 'minutes')}`;
    }
  };

  const tableRows = useMemo(() => {
    return (filteredRows?.length || allEntries === false ? filteredRows : visitQueueEntries)?.map((entry) => ({
      ...entry,
      name: {
        content: (
          <PatientNameLink to={`\${openmrsSpaBase}/patient/${entry.patientUuid}/chart`} from={fromPage}>
            {entry.name}
          </PatientNameLink>
        ),
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
      status: {
        content: (
          <span className={styles.statusContainer}>
            <StatusIcon status={entry.status} />
            <span>{buildStatusString(entry.status, entry.service)}</span>
          </span>
        ),
      },
      waitTime: {
        content: <span className={styles.statusContainer}>{formatWaitTime(entry.waitTime)}</span>,
      },
    }));
  }, [filteredRows, visitQueueEntries]);

  const handleServiceChange = ({ selectedItem }) => {
    setFilter(selectedItem.display);
  };

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

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (visitQueueEntries?.length) {
    return (
      <div className={styles.container}>
        <div className={styles.headerBtnContainer}>
          <Button
            size="sm"
            kind="ghost"
            renderIcon={(props) => <ArrowRight size={16} {...props} />}
            onClick={() => {
              setShowOverlay(true);
              setView(SearchTypes.QUEUE_SERVICE_FORM);
            }}
            iconDescription={t('addNewQueue', 'Add new queue')}>
            {t('addNewService', 'Add new service')}
          </Button>
        </div>
        <div className={styles.headerContainer}>
          <span className={styles.heading}>{t('patientsCurrentlyInQueue', 'Patients currently in queue')}</span>
          <div className={styles.headerButtons}></div>
        </div>
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
                      initialSelectedItem={{ display: `${t('all', 'All')}` }}
                      titleText={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
                      label={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
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
                  <Button
                    size="sm"
                    kind="secondary"
                    className={styles.addPatientToListBtn}
                    renderIcon={(props) => <Add size={16} {...props} />}
                    onClick={() => {
                      setShowOverlay(true);
                      setView('');
                    }}
                    iconDescription={t('addPatientToQueue', 'Add patient to queue')}>
                    {t('addPatientToQueue', 'Add patient to queue')}
                  </Button>
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
                            <EditMenu queueEntry={visitQueueEntries?.[index]} />
                          </TableCell>
                          <TableCell className="cds--table-column-menu">
                            <ActionsMenu queueEntry={visitQueueEntries?.[index]} />
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
            </TableContainer>
          )}
        </DataTable>
        {showOverlay && <PatientSearch view={view} closePanel={() => setShowOverlay(false)} />}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerBtnContainer}>
        <Button
          size="sm"
          kind="ghost"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={() => {
            setShowOverlay(true);
            setView(SearchTypes.QUEUE_SERVICE_FORM);
          }}
          iconDescription={t('addNewQueue', 'Add new queue')}>
          {t('addNewService', 'Add new service')}
        </Button>
      </div>
      <div className={styles.headerContainer}>
        <label className={styles.heading}>{t('patientsCurrentlyInQueue', 'Patients currently in queue')}</label>
        <Button
          iconDescription={t('addPatientToQueue', 'Add patient to queue')}
          kind="secondary"
          onClick={() => setShowOverlay(true)}
          renderIcon={(props) => <Add size={16} {...props} />}
          size="sm">
          {t('addPatientToQueue', 'Add patient to queue')}
        </Button>
      </div>
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={(props) => <Add size={16} {...props} />}
            onClick={() => setShowOverlay(true)}>
            {t('addPatientToQueue', 'Add patient to queue')}
          </Button>
        </Tile>
      </div>
      {showOverlay && <PatientSearch view={view} closePanel={() => setShowOverlay(false)} />}
    </div>
  );
}

export default ActiveVisitsTable;
