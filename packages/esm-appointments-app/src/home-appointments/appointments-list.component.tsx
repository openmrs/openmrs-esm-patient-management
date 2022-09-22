import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  Layer,
  DataTableSkeleton,
  DataTableHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  MultiSelect,
  Tile,
  Pagination,
} from '@carbon/react';
import { CheckmarkOutline, SubtractAlt, CloseOutline } from '@carbon/react/icons';
import { isDesktop, useLayoutType, ConfigurableLink, useConfig, usePagination } from '@openmrs/esm-framework';
import { useTodayAppointments } from './appointments-table.resource';

import { EmptyDataIllustration } from './emptyData';
import { launchCheckInAppointmentModal, handleComplete } from './common';
import { SeeAllAppointmentsLink, AddAppointmentLink, ViewCalendarLink } from './links';
import { useSWRConfig } from 'swr';
import { ActionsMenu } from './appointment-actions.component';
import { MappedHomeAppointment } from '../types';

import styles from './appointments-list.scss';

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};
interface PaginationData {
  goTo: (page: number) => void;
  results: Array<MappedHomeAppointment>;
  currentPage: number;
}

const ServiceColor = ({ color }) => <div className={styles.serviceColor} style={{ backgroundColor: `${color}` }} />;

const RenderStatus = ({ status, t, appointmentUuid, mutate }) => {
  switch (status) {
    case 'Completed':
      return (
        <div className={styles.completeIcon}>
          {t('completed', 'Completed')}
          <CheckmarkOutline size={16} />
        </div>
      );
    case 'Missed':
      return (
        <div className={styles.missedIcon}>
          {t('missed', 'Missed')}
          <SubtractAlt size={16} />
        </div>
      );
    case 'Cancelled':
      return (
        <div className={styles.cancelIcon}>
          {t('cancelled', 'Cancelled')}
          <CloseOutline size={16} />
        </div>
      );
    case 'CheckedIn':
      return (
        <Button kind="ghost" className={styles.actionButton} onClick={() => handleComplete(appointmentUuid, mutate, t)}>
          {t('complete', 'Complete')}
        </Button>
      );
    default:
      return (
        <Button
          kind="ghost"
          className={styles.actionButton}
          disabled={status === 'CheckedIn'}
          onClick={() => launchCheckInAppointmentModal(appointmentUuid)}>
          {t('checkIn', 'Check In')}
        </Button>
      );
  }
};

const AppointmentsBaseTable = () => {
  const { useBahmniAppointmentsUI: useBahmniUI } = useConfig();
  const { isLoading, appointments } = useTodayAppointments();

  const [filteredRows, setFilteredRows] = useState<Array<MappedHomeAppointment>>([]);
  const [filters, setFilters] = useState(['CheckedIn', 'Scheduled']);

  const filterItems = [
    { id: 'checkedIn', label: 'CheckedIn' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'completed', label: 'Completed' },
    { id: 'missed', label: 'Missed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filterLabel = (
    <div className={styles.filterLabelContainer}>
      {filters.map((f) => (
        <div className={styles.filterLabel}>{f}</div>
      ))}
    </div>
  );

  useEffect(() => {
    if (filters) {
      setFilteredRows(appointments?.filter((appointment) => filters.includes(appointment.status)));
    }
  }, [filters, filteredRows, appointments]);

  const handleStatusChange = ({ selectedItems }) => {
    setFilters(selectedItems.map((i) => i?.label));
  };

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedAppointments,
    currentPage,
  }: PaginationData = usePagination(filteredRows, currentPageSize);

  const { t } = useTranslation();
  const layout = useLayoutType();
  const { mutate } = useSWRConfig();

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('dateTime', 'Date and time'),
        key: 'dateTime',
      },
      {
        id: 1,
        header: t('name', 'Patient Name'),
        key: 'name',
      },
      {
        id: 2,
        header: t('identifier', 'Identifier'),
        key: 'identifier',
      },
      {
        id: 3,
        header: t('location', 'Location'),
        key: 'location',
      },
      {
        id: 4,
        header: t('service', 'Service'),
        key: 'service',
      },
      {
        id: 5,
        header: t('actions', 'Actions'),
        key: 'actionButton',
      },
    ],
    [t],
  );

  const tableRows = paginatedAppointments?.map((appointment) => ({
    id: appointment.id,
    dateTime: {
      content: (
        <span className={styles.statusContainer}>
          <span className={styles.startTime}>{appointment.dateTime}</span>
          {appointment.duration}
        </span>
      ),
    },
    name: {
      content: (
        <div className={styles.nameContainer}>
          <ConfigurableLink to={`\${openmrsSpaBase}/patient/${appointment.patientUuid}/chart`}>
            {appointment.name}
          </ConfigurableLink>
        </div>
      ),
    },
    identifier: {
      content: (
        <div className={styles.nameContainer}>
          <span className={styles.identifier}>{appointment.identifier}</span>
        </div>
      ),
    },
    location: {
      content: <span className={styles.statusContainer}>{appointment.location}</span>,
    },
    service: {
      content: (
        <span className={styles.serviceContainer}>
          <ServiceColor color={appointment.serviceColor} />
          {appointment.serviceType}
        </span>
      ),
    },
    actionButton: {
      content: (
        <span className={styles.serviceContainer}>
          <RenderStatus status={appointment.status} appointmentUuid={appointment.id} t={t} mutate={mutate} />
        </span>
      ),
    },
  }));

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

  if (appointments?.length === 0) {
    return (
      <div className={styles.homeAppointmentsContainer}>
        <Layer>
          <Tile className={styles.tile}>
            <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
              <h4>{t('todaysAppointments', "Today's Appointments")}</h4>
            </div>
            <p className={styles.content}>{t('noAppointmentsToDisplay', 'No appointments to display')}</p>
            <EmptyDataIllustration />
            <AddAppointmentLink />
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <>
      <div className={styles.homeAppointmentsContainer}>
        <div className={styles.headerContainer}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('todaysAppointments', "Today's Appointments")}</h4>
          </div>
          <div className={styles.actionLinks}>
            <ViewCalendarLink />
            <AddAppointmentLink />
          </div>
        </div>
        <DataTable
          data-floating-menu-container
          filterRows={handleFilter}
          headers={tableHeaders}
          overflowMenuOnHover={isDesktop(layout)}
          rows={tableRows}
          size={isDesktop(layout) ? 'xs' : 'md'}
          useZebraStyles={filteredRows?.length > 1}>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps, getBatchActionProps }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{
                  minHeight: 0,
                  top: '-22px',
                  overflow: 'visible',
                  backgroundColor: 'color',
                }}>
                <TableToolbarContent className={styles.tableToolbarContent}>
                  <MultiSelect
                    tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                    ariaLabel="Status MultiSelect"
                    id="appointment-status-multiselect"
                    itemToString={(item) => item.label}
                    initialSelectedItems={filterItems.filter((i) => filters.includes(i.label))}
                    compareItems={function noRefCheck() {}}
                    onChange={handleStatusChange}
                    items={filterItems}
                    label={filterLabel || 'Filter by status'}
                    useTitleInItem={true}
                    type="inline"
                    titleText={t('showAppointmentsThatAre', 'Show appointments that are') + ':'}
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.appointmentsTable}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.id}>
                        {header.header}
                      </TableHeader>
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
                          <TableCell className="cds--table-column-menu">
                            <ActionsMenu appointment={appointments?.[index]} useBahmniUI={useBahmniUI} />
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={filteredRows.length}
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
      </div>
      <SeeAllAppointmentsLink />
    </>
  );
};

export default AppointmentsBaseTable;
