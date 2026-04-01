import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  MultiSelect,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBatchAction,
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
  formatDate,
  formatDatetime,
  isDesktop,
  parseDate,
  useConfig,
  useLayoutType,
  launchWorkspace2,
  usePagination,
  showModal,
  TableBatchActions,
} from '@openmrs/esm-framework';
import { exportAppointmentsToSpreadsheet } from '../../helpers/excel';
import { AppointmentStatus, type Appointment } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { getPageSizes, useAppointmentSearchResults } from '../utils';
import AppointmentActions from './appointments-actions.component';
import AppointmentDetails from '../details/appointment-details.component';
import { useAppointmentsStore } from '../../store';
import { useActiveVisits } from '../../hooks/useActiveVisits';
import styles from './appointments-table.scss';

interface AppointmentsTableProps {
  appointments: Array<Appointment>;
  isLoading: boolean;
  tableHeading: string;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments, isLoading, tableHeading }) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(25);
  const [searchString, setSearchString] = useState('');
  const { selectedAppointmentStatuses, setSelectedAppointmentStatuses } = useAppointmentsStore();
  const config = useConfig<ConfigObject>();
  const { appointmentsTableColumns } = config;
  const searchResults = useAppointmentSearchResults(appointments, searchString, selectedAppointmentStatuses);
  const { results, goTo, currentPage } = usePagination(searchResults, pageSize);
  const { customPatientChartUrl, patientIdentifierType } = useConfig<ConfigObject>();
  const [selectedAppointmentUuids, setSelectedAppointmentUuids] = useState(new Set<string>());
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { visits, mutateVisits } = useActiveVisits();

  const activeVisitsByPatientUuid = useMemo(
    () =>
      new Map(
        visits
          ?.filter((visit) => visit?.startDatetime && !visit?.stopDatetime)
          .map((visit) => [visit.patient.uuid, visit]),
      ),
    [visits],
  );

  useEffect(() => {
    setSelectedAppointmentUuids(new Set());
  }, [appointments]);

  const unsortableColumns = ['actions', 'overflowMenu'];

  const headerData = appointmentsTableColumns.map((columnKey) => ({
    header: t(columnKey, columnKey),
    key: columnKey,
  }));
  headerData.push({ header: '', key: 'overflowMenu' });

  const rowData = useMemo(
    () =>
      results?.map((appointment) => {
        return {
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
          visitStartTime: activeVisitsByPatientUuid.has(appointment.patient.uuid)
            ? formatDatetime(new Date(activeVisitsByPatientUuid.get(appointment.patient.uuid).startDatetime))
            : '--',
          serviceType: appointment.service.name,
          location: appointment.location?.name,
          provider: appointment.providers?.[0]?.name ?? '--',
          status: t(appointment.status),
          actions: (
            <div className={styles.actionsCell}>
              <AppointmentActions
                appointment={appointment}
                hasActiveVisit={activeVisitsByPatientUuid.has(appointment.patient.uuid)}
                mutateVisits={mutateVisits}
              />
            </div>
          ),
          overflowMenu: (
            <OverflowMenu align="left" aria-label={t('actions', 'Actions')} flipped size={responsiveSize}>
              <OverflowMenuItem
                className={styles.menuItem}
                itemText={t('editAppointment', 'Edit appointment')}
                onClick={() =>
                  launchWorkspace2('appointments-form-workspace', {
                    patientUuid: appointment.patient.uuid,
                    appointment: appointment,
                  })
                }
              />
            </OverflowMenu>
          ),
          appointment,
        };
      }),
    [results, customPatientChartUrl, patientIdentifierType, responsiveSize, t, activeVisitsByPatientUuid, mutateVisits],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" rowCount={5} />;
  }

  return (
    <Layer className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
          <h2>{tableHeading}</h2>
        </div>
      </div>
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
                  <MultiSelect
                    id="statusMultiSelect"
                    size={responsiveSize}
                    items={Object.values(AppointmentStatus).map((status) => ({ id: status, label: t(status) }))}
                    itemToString={(item) => (item ? item.label : '')}
                    label={t('filterAppointmentsByStatus', 'Filter appointments by status')}
                    onChange={({ selectedItems }) =>
                      setSelectedAppointmentStatuses([...new Set(selectedItems.map((item) => item.id))])
                    }
                    type="inline"
                    selectedItems={selectedAppointmentStatuses.map((status) => ({ id: status, label: t(status) }))}
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
                      checked={selectedAppointmentUuids.size === rows.length && selectedAppointmentUuids.size > 0}
                      onSelect={() => {
                        if (selectedAppointmentUuids.size < rows.length) {
                          setSelectedAppointmentUuids(new Set(rows.map((row) => row.id)));
                        } else {
                          setSelectedAppointmentUuids(new Set());
                        }
                      }}
                    />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header, isSortable: !unsortableColumns.includes(header.key) })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const matchingAppointment = appointments.find((appointment) => appointment.uuid === row.id);

                    if (!matchingAppointment) {
                      return null;
                    }

                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          <TableSelectRow
                            {...getSelectionProps({ row })}
                            checked={selectedAppointmentUuids.has(row.id)}
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
            ) : (
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
            )}
          </>
        )}
      </DataTable>
    </Layer>
  );
};

export default AppointmentsTable;
