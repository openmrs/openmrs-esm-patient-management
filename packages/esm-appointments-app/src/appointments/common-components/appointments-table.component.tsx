import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { Calendar, Download } from '@carbon/react/icons';
import {
  ConfigurableLink,
  EmptyCard,
  formatDate,
  formatDatetime,
  isDesktop,
  parseDate,
  useConfig,
  useLayoutType,
  launchWorkspace2,
  usePagination,
  showModal,
} from '@openmrs/esm-framework';
import { exportAppointmentsToSpreadsheet } from '../../helpers/excel';
import { useTodaysVisits } from '../../hooks/useTodaysVisits';
import { type Appointment } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { getPageSizes, useAppointmentSearchResults } from '../utils';
import { launchCreateAppointmentForm } from '../../helpers';
import AppointmentActions from './appointments-actions.component';
import AppointmentDetails from '../details/appointment-details.component';
import styles from './appointments-table.scss';

dayjs.extend(utc);
dayjs.extend(isToday);

interface AppointmentsTableProps {
  appointments: Array<Appointment>;
  isLoading: boolean;
  tableHeading: string;
  hasActiveFilters?: boolean;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  isLoading,
  tableHeading,
  hasActiveFilters,
}) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(25);
  const [searchString, setSearchString] = useState('');
  const config = useConfig<ConfigObject>();
  const { appointmentsTableColumns } = config;
  const searchResults = useAppointmentSearchResults(appointments, searchString);
  const { results, goTo, currentPage } = usePagination(searchResults, pageSize);
  const { customPatientChartUrl, patientIdentifierType } = useConfig<ConfigObject>();
  const { visits } = useTodaysVisits();
  const [selectedAppointmentUuids, setSelectedAppointmentUuids] = useState(new Set<string>());
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';

  useEffect(() => {
    setSelectedAppointmentUuids(new Set());
  }, [appointments]);

  const headerData = appointmentsTableColumns.map((columnKey) => ({
    header: t(columnKey, columnKey),
    key: columnKey,
  }));

  const rowData = useMemo(
    () =>
      results?.map((appointment) => ({
        id: appointment.uuid,
        patientName: (
          <ConfigurableLink
            className={styles.link}
            to={customPatientChartUrl}
            templateParams={{ patientUuid: appointment.patient.uuid }}>
            {appointment.patient.name}
          </ConfigurableLink>
        ),
        nextAppointmentDate: '--',
        identifier: patientIdentifierType
          ? (appointment.patient[patientIdentifierType.replaceAll(' ', '')] ?? appointment.patient.identifier)
          : appointment.patient.identifier,
        dateTime: formatDatetime(new Date(appointment.startDateTime)),
        serviceType: appointment.service.name,
        location: appointment.location?.name,
        provider: appointment.providers?.[0]?.name ?? '--',
        status: <AppointmentActions appointment={appointment} />,
        appointment,
      })),
    [results, customPatientChartUrl, patientIdentifierType],
  );

  const appointmentUuidsWithChangeableStatus = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const visitDate = dayjs(appointment.startDateTime);
        const isFutureAppointment = visitDate.isAfter(dayjs());
        const isTodayAppointment = visitDate.isToday();
        const hasActiveVisitToday = visits?.some(
          (visit) => visit?.patient?.uuid === appointment.patient?.uuid && visit?.startDatetime,
        );
        return isFutureAppointment || (isTodayAppointment && !hasActiveVisitToday);
      })
      .map((appointment) => appointment.uuid);
  }, [appointments, visits]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" rowCount={5} />;
  }

  if (hasActiveFilters && !appointments?.length) {
    return (
      <div className={styles.filterEmptyState}>
        <Layer level={0}>
          <Tile className={styles.filterEmptyStateTile}>
            <p className={styles.filterEmptyStateContent}>
              {t('noMatchingAppointments', 'No matching appointments found')}
            </p>
            <p className={styles.filterEmptyStateHelper}>{t('checkFilters', 'Check the filters above')}</p>
          </Tile>
        </Layer>
      </div>
    );
  }

  if (!appointments?.length) {
    const translatedHeading = t(tableHeading);
    return (
      <EmptyCard
        headerTitle={`${translatedHeading} ${t('appointments_lower', 'appointments')}`}
        displayText={
          tableHeading === t('todays', "Today's")
            ? t('appointmentsScheduledForToday', 'appointments scheduled for today')
            : t('appointments_lower', 'appointments')
        }
        launchForm={() => launchCreateAppointmentForm(t)}
      />
    );
  }

  return (
    <Layer className={styles.container}>
      <Tile className={styles.headerContainer}>
        <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
          <h2>{`${t(tableHeading)} ${t('appointments', 'Appointments')}`}</h2>
        </div>
      </Tile>
      <DataTable
        aria-label={t('appointmentsTable', 'Appointments table')}
        data-floating-menu-container
        rows={rowData}
        headers={headerData}
        isSortable
        size={responsiveSize}
        useZebraStyles>
        {({
          rows,
          headers,
          getExpandHeaderProps,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getTableProps,
          getTableContainerProps,
          getToolbarProps,
        }) => (
          <>
            <TableContainer {...getTableContainerProps()}>
              <TableToolbar {...getToolbarProps()} size={responsiveSize}>
                <TableBatchActions
                  shouldShowBatchActions={selectedAppointmentUuids.size > 0}
                  totalSelected={selectedAppointmentUuids.size}
                  // TODO: add translation for Carbon's table batch actions
                  // https://openmrs.atlassian.net/browse/O3-5409
                  onCancel={() => setSelectedAppointmentUuids(new Set())}>
                  <TableBatchAction
                    renderIcon={Calendar}
                    onClick={() => {
                      const selectedAppointments = appointments.filter((app) => selectedAppointmentUuids.has(app.uuid));
                      const closeModal = showModal('batch-change-appointments-statuses-modal', {
                        appointments: selectedAppointments,
                        closeModal: () => closeModal(),
                      });
                    }}>
                    {t('changeStatus', 'Change status')}
                  </TableBatchAction>
                </TableBatchActions>
                <TableToolbarContent>
                  <TableToolbarSearch
                    className={styles.searchbar}
                    labelText={t('filterAppointments', 'Filter appointments')}
                    placeholder={t('filterTable', 'Filter table')}
                    onChange={(event) => setSearchString((event as React.ChangeEvent<HTMLInputElement>).target.value)}
                    persistent
                    size={responsiveSize}
                  />
                  <Button
                    size={responsiveSize}
                    kind="tertiary"
                    renderIcon={Download}
                    onClick={() => {
                      const date = appointments[0]?.startDateTime
                        ? formatDate(parseDate(appointments[0]?.startDateTime), {
                            time: false,
                            noToday: true,
                          })
                        : null;
                      exportAppointmentsToSpreadsheet(appointments, rowData, `${tableHeading}_appointments_${date}`);
                    }}>
                    {t('download', 'Download')}
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    <TableSelectAll
                      {...getSelectionProps()}
                      checked={
                        selectedAppointmentUuids.size === appointmentUuidsWithChangeableStatus.length &&
                        selectedAppointmentUuids.size > 0
                      }
                      onSelect={() => {
                        if (selectedAppointmentUuids.size < appointmentUuidsWithChangeableStatus.length) {
                          setSelectedAppointmentUuids(new Set(appointmentUuidsWithChangeableStatus));
                        } else {
                          setSelectedAppointmentUuids(new Set());
                        }
                      }}
                    />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                    <TableHeader aria-label={t('actions', 'Actions')} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const matchingAppointment = appointments.find((appointment) => appointment.uuid === row.id);

                    if (!matchingAppointment) {
                      return null;
                    }

                    const canChangeStatus = appointmentUuidsWithChangeableStatus.includes(matchingAppointment.uuid);

                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          <TableSelectRow
                            {...getSelectionProps({ row })}
                            checked={selectedAppointmentUuids.has(row.id)}
                            disabled={!canChangeStatus}
                            onSelect={() => {
                              if (selectedAppointmentUuids.has(row.id)) {
                                setSelectedAppointmentUuids(
                                  new Set([...selectedAppointmentUuids].filter((uuid) => uuid != row.id)),
                                );
                              } else {
                                setSelectedAppointmentUuids(new Set([...selectedAppointmentUuids, row.id]));
                              }
                            }}
                          />
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                          <TableCell className="cds--table-column-menu">
                            {canChangeStatus ? (
                              <OverflowMenu
                                align="left"
                                aria-label={t('actions', 'Actions')}
                                flipped
                                size={responsiveSize}>
                                <OverflowMenuItem
                                  className={styles.menuItem}
                                  itemText={t('editAppointment', 'Edit appointment')}
                                  onClick={() =>
                                    launchWorkspace2('appointments-form-workspace', {
                                      patientUuid: matchingAppointment.patient.uuid,
                                      appointment: matchingAppointment,
                                    })
                                  }
                                />
                              </OverflowMenu>
                            ) : null}
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 2}>
                            <AppointmentDetails appointment={matchingAppointment} />
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Layer>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noAppointmentsToDisplay', 'No appointments to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </Layer>
              </div>
            ) : null}
          </>
        )}
      </DataTable>
      <Pagination
        backwardText={t('previousPage', 'Previous page')}
        forwardText={t('nextPage', 'Next page')}
        itemsPerPageText={t('itemsPerPage', 'Items per page') + ':'}
        page={currentPage}
        pageNumberText={t('pageNumber', 'Page number')}
        pageSize={pageSize}
        pageSizes={getPageSizes(appointments, pageSize) ?? []}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
        totalItems={appointments.length ?? 0}
      />
    </Layer>
  );
};

export default AppointmentsTable;
