import React, { useEffect, useMemo, useState, useCallback, MouseEvent, AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableHeader,
  DataTableSkeleton,
  Dropdown,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  Tile,
  TooltipDefinition,
  Button,
} from 'carbon-components-react';
import Group16 from '@carbon/icons-react/es/group/16';
import InProgress16 from '@carbon/icons-react/es/in-progress/16';
import { useLayoutType, navigate, showModal, interpolateUrl, ExtensionSlot, formatDate } from '@openmrs/esm-framework';
import {
  useServices,
  QueueService,
  QueueStatus,
  MappedQueuePriority,
  getOriginFromPathName,
} from '../active-visits/active-visits-table.resource';
import { MappedVisitQueueEntry, useQueueDetails } from './queue-patient.resource';
import styles from './queue-patient-table.scss';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import { Close16, Filter16 } from '@carbon/icons-react';

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

interface QueuePatientTableProps {
  title: string;
  patientData: Array<any>;
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

function ActionsMenu({ patientUuid }: { patientUuid: string }) {
  const { t } = useTranslation();

  const launchEndVisitModal = useCallback(() => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    <OverflowMenu light selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#editPatientDetails"
        itemText={t('editPatientDetails', 'Edit patient details')}
        onClick={() =>
          navigate({
            to: `\${openmrsSpaBase}/patient/${patientUuid}/edit`,
          })
        }>
        {t('editPatientDetails', 'Edit patient details')}
      </OverflowMenuItem>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#setWaitTimeManually"
        itemText={t('setWaitTimeManually', 'Set wait time manually')}>
        {t('setWaitTimeManually', 'Set wait time manually')}
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
  );
}

function StatusIcon({ status }) {
  switch (status as QueueStatus) {
    case 'Waiting':
      return <InProgress16 />;
    case 'In Service':
      return <Group16 />;
    default:
      return null;
  }
}

const QueuePatientBaseTable: React.FC<QueuePatientTableProps> = ({ title, patientData }) => {
  const { t } = useTranslation();
  const { services } = useServices();
  const { linelistsQueueEntries: visitQueueEntries, isLoading } = useQueueDetails();
  const [filteredRows, setFilteredRows] = useState<Array<MappedVisitQueueEntry>>([]);
  const [filter, setFilter] = useState('');
  const isDesktop = useLayoutType() === 'desktop';

  const currentPathName: string = window.location.pathname;
  const fromPage: string = getOriginFromPathName(currentPathName);

  useEffect(() => {
    if (filter) {
      setFilteredRows(visitQueueEntries?.filter((entry) => entry.service === filter && /waiting/i.exec(entry.status)));
      setFilter('');
    }
  }, [filter, filteredRows, patientData]);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('gender', 'Gender'),
        key: 'gender',
      },
      {
        id: 2,
        header: t('age', 'Age'),
        key: 'age',
      },
      {
        id: 3,
        header: t('dob', 'Dob'),
        key: 'dob',
      },
      {
        id: 4,
        header: t('priority', 'Priority'),
        key: 'priority',
      },
      {
        id: 5,
        header: t('status', 'Status'),
        key: 'status',
      },
      {
        id: 6,
        header: t('waitTime', 'Wait time (mins)'),
        key: 'waitTime',
      },
      {
        id: 7,
        header: t('provider', 'Provider'),
        key: 'provider',
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
    }
  };

  const tableRows = useMemo(() => {
    return (filteredRows.length ? filteredRows : patientData)?.map((entry) => ({
      ...entry,
      name: {
        content: (
          <PatientNameLink to={`\${openmrsSpaBase}/patient/${entry.patientUuid}/chart`} from={fromPage}>
            {entry.name}
          </PatientNameLink>
        ),
      },
      age: {
        content: <p>{entry.age}</p>,
      },
      gender: {
        content: <p>{entry.gender}</p>,
      },
      dob: {
        content: <p>{entry.dob}</p>,
      },
      priority: {
        content: (
          <>
            {entry?.priorityComment ? (
              <TooltipDefinition
                className={styles.tooltip}
                align="start"
                direction="bottom"
                tooltipText={entry.priorityComment}>
                <Tag
                  className={entry.priority === 'Priority' ? styles.priorityTag : styles.tag}
                  type={getTagType(entry.priority as string)}>
                  {entry.priority}
                </Tag>
              </TooltipDefinition>
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
      provider: {
        content: <p>{entry.provider?.name}</p>,
      },
    }));
  }, [filteredRows, patientData]);

  const handleServiceChange = ({ selectedItem }) => {
    setFilter(selectedItem);
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
            return ('' + filterableValue.content.props.children.props.children.props.children)
              .toLowerCase()
              .includes(filterTerm);
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

  return (
    <div className={styles.container}>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" className={styles.breadcrumbsSlot} />

      <div className={styles.headerContainer}>
        <div>
          <p className={styles.title}>
            {' '}
            {title} {fromPage}
          </p>
          <p className={styles.subTitle}>
            {' '}
            {patientData?.length} patients Last Updated: {formatDate(new Date(), { mode: 'standard' })}
          </p>
        </div>

        <Button kind="ghost" size="small" renderIcon={OverflowMenuVertical16}>
          {t('actions', 'Actions')}
        </Button>
      </div>

      <Tile className={styles.filterTile}>
        <Tag size="md" title="Clear Filter" type="blue">
          {t('today', 'Today')}
        </Tag>

        <div className={styles.actionsBtn}>
          <Button renderIcon={Filter16} kind="ghost">
            {t('filter', 'Filter (1)')}
          </Button>
        </div>
      </Tile>

      {patientData?.length ? (
        <DataTable
          data-floating-menu-container
          filterRows={handleFilter}
          headers={tableHeaders}
          overflowMenuOnHover={isDesktop ? true : false}
          rows={tableRows}
          size="compact"
          useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar>
                <TableToolbarContent>
                  <div className={styles.filterContainer}>
                    <Dropdown
                      id="serviceFilter"
                      initialSelectedItem={'All'}
                      label=""
                      titleText={t('showPatientsWaitingFor', 'Show patients waiting for') + ':'}
                      type="inline"
                      items={['All', ...services]}
                      onChange={handleServiceChange}
                      size="sm"
                    />
                  </div>
                  <TableToolbarSearch
                    className={styles.search}
                    expanded
                    light
                    onChange={onInputChange}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.activeVisitsTable}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                          <TableCell className="bx--table-column-menu">
                            <ActionsMenu patientUuid={tableRows?.[index]?.patientUuid} />
                          </TableCell>
                        </TableRow>
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
                  </Tile>
                </div>
              ) : null}
            </TableContainer>
          )}
        </DataTable>
      ) : (
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
        </Tile>
      )}
    </div>
  );
};

export default QueuePatientBaseTable;
