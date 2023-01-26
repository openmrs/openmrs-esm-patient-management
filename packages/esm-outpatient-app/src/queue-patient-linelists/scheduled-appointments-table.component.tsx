import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
  Layer,
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
  DataTableSkeleton,
  Dropdown,
  Pagination,
} from '@carbon/react';
import { Filter, OverflowMenuVertical } from '@carbon/react/icons';
import {
  ConfigObject,
  ExtensionSlot,
  formatDatetime,
  useConfig,
  usePagination,
  ConfigurableLink,
  formatDate,
} from '@openmrs/esm-framework';
import styles from './queue-linelist-base-table.scss';
import QueueLinelist from './queue-linelist.component';
import { updateSelectedAppointmentStatus, useSelectedAppointmentStatus } from '../helpers/helpers';
import { useAppointments } from './queue-linelist.resource';
import { getGender } from '../helpers/functions';

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

const AppointmentsTable: React.FC = () => {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(false);
  const { appointmentStatuses } = useConfig() as ConfigObject;
  const currentAppointmentStatus = useSelectedAppointmentStatus();
  const { appointmentQueueEntries, isLoading } = useAppointments();
  const [filteredRows, setFilteredRows] = useState(appointmentQueueEntries);
  const { results, currentPage, goTo } = usePagination(filteredRows ?? [], 20);

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

  useEffect(() => {
    if (currentAppointmentStatus != t('all', 'All') && currentAppointmentStatus !== '') {
      setFilteredRows(
        appointmentQueueEntries?.filter((appointment) => appointment.status === currentAppointmentStatus),
      );
    } else {
      setFilteredRows(appointmentQueueEntries);
    }
  }, [t, currentAppointmentStatus, results, appointmentQueueEntries]);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('returnDate', 'Return Date'),
        key: 'returnDate',
      },
      {
        id: 2,
        header: t('gender', 'Gender'),
        key: 'gender',
      },
      {
        id: 3,
        header: t('age', 'Age'),
        key: 'age',
      },
      {
        id: 4,
        header: t('visitType', 'Visit Type'),
        key: 'visitType',
      },
      {
        id: 5,
        header: t('status', 'Status'),
        key: 'status',
      },
      {
        id: 6,
        header: t('phoneNumber', 'Phone Number'),
        key: 'phoneNumber',
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return results?.map((appointment) => ({
      id: appointment.uuid,
      name: {
        content: (
          <ConfigurableLink to={`\${openmrsSpaBase}/patient/${appointment.patient.uuid}/chart`}>
            {appointment.patient.name}
          </ConfigurableLink>
        ),
      },
      returnDate: formatDate(new Date(appointment.startDateTime), {
        mode: 'wide',
      }),
      gender: getGender(appointment.patient?.gender, t),
      age: appointment.patient.age,
      visitType: appointment.appointmentKind,
      status: appointment.status,
      phoneNumber: appointment.patient?.phoneNumber,
    }));
  }, [results, t]);

  const handleStatusChange = ({ selectedItem }) => {
    updateSelectedAppointmentStatus(selectedItem);
  };

  const pageSizes = useMemo(() => {
    const numberOfPages = Math.ceil(appointmentQueueEntries?.length / 20);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * 20;
    });
  }, [appointmentQueueEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <div className={styles.container}>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />

      <div className={styles.headerContainer}>
        <div>
          <p className={styles.title}>{t('scheduledAppointmentsList', 'Scheduled appointments patient list')}</p>
          <p className={styles.subTitle}>
            {appointmentQueueEntries?.length} · Last Updated: {formatDatetime(new Date(), { mode: 'standard' })}
          </p>
        </div>

        <Button kind="ghost" size="sm" renderIcon={(props) => <OverflowMenuVertical size={16} {...props} />}>
          {t('actions', 'Actions')}
        </Button>
      </div>

      <Layer>
        <Tile className={styles.filterTile}>
          <Tag size="md" title="Clear Filter" type="blue">
            {t('today', 'Today')}
          </Tag>

          <div className={styles.actionsBtn}>
            <Button
              kind="ghost"
              renderIcon={(props) => <Filter size={16} {...props} />}
              iconDescription={t('filter', 'Filter (1)')}
              onClick={() => setShowOverlay(true)}
              size="sm">
              {t('filter', 'Filter (1)')}
            </Button>
          </div>
        </Tile>
      </Layer>

      <DataTable
        data-floating-menu-container
        filterRows={handleFilter}
        headers={tableHeaders}
        overflowMenuOnHover={false}
        rows={tableRows}
        size="md"
        useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar
              style={{
                position: 'static',
                height: '3rem',
                overflow: 'visible',
                backgroundColor: 'color',
              }}>
              <TableToolbarContent className={styles.toolbarContent}>
                <div className={styles.filterContainer}>
                  <Dropdown
                    id="serviceFilter"
                    initialSelectedItem={'All'}
                    label={currentAppointmentStatus}
                    titleText={t('status', 'Status') + ':'}
                    type="inline"
                    items={['All', ...appointmentStatuses]}
                    onChange={handleStatusChange}
                    size="sm"
                  />
                </div>

                <TableToolbarSearch
                  className={styles.search}
                  expanded
                  onChange={onInputChange}
                  placeholder={t('searchThisList', 'Search this list')}
                  size="sm"
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} className={styles.queueTable}>
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
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Layer>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </Layer>
              </div>
            ) : null}
          </TableContainer>
        )}
      </DataTable>

      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        page={currentPage}
        pageNumberText="Page Number"
        pageSize={20}
        onChange={({ page }) => goTo(page)}
        pageSizes={pageSizes?.length > 0 ? pageSizes : [20]}
        totalItems={appointmentQueueEntries?.length ?? 0}
      />

      {showOverlay && <QueueLinelist closePanel={() => setShowOverlay(false)} />}
    </div>
  );
};

export default AppointmentsTable;
