import React, { useState } from 'react';
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
  Search,
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
  Tile,
} from '@carbon/react';
import {
  ConfigurableLink,
  formatDate,
  formatDatetime,
  isDesktop,
  parseDate,
  useConfig,
  useLayoutType,
  launchWorkspace,
  usePagination,
} from '@openmrs/esm-framework';
import { Download } from '@carbon/react/icons';
import { EmptyState } from '../../empty-state/empty-state.component';
import { downloadAppointmentsAsExcel } from '../../helpers/excel';
import { useTodaysVisits } from '../../hooks/useTodaysVisits';
import { type Appointment } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { getPageSizes, useAppointmentSearchResults } from '../utils';
import AppointmentActions from './appointments-actions.component';
import AppointmentDetails from '../details/appointment-details.component';
import PatientSearch from '../../patient-search/patient-search.component';
import styles from './appointments-table.scss';

dayjs.extend(utc);
dayjs.extend(isToday);

interface AppointmentsTableProps {
  appointments: Array<Appointment>;
  isLoading: boolean;
  tableHeading: string;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments, isLoading, tableHeading }) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(25);
  const [searchString, setSearchString] = useState('');
  const searchResults = useAppointmentSearchResults(appointments, searchString);
  const { results, goTo, currentPage } = usePagination(searchResults, pageSize);
  const { customPatientChartUrl, patientIdentifierType } = useConfig<ConfigObject>();
  const { visits } = useTodaysVisits();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const headerData = [
    {
      header: t('patientName', 'Patient name'),
      key: 'patientName',
    },
    {
      header: t('identifier', 'Identifier'),
      key: 'identifier',
    },
    {
      header: t('location', 'Location'),
      key: 'location',
    },
    {
      header: t('serviceType', 'Service type'),
      key: 'serviceType',
    },
    {
      header: t('status', 'Status'),
      key: 'status',
    },
  ];

  const rowData = results?.map((appointment) => ({
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
      ? appointment.patient[patientIdentifierType.replaceAll(' ', '')] ?? appointment.patient.identifier
      : appointment.patient.identifier,
    dateTime: formatDatetime(new Date(appointment.startDateTime)),
    serviceType: appointment.service.name,
    location: appointment.location?.name,
    provider: appointment.provider,
    status: <AppointmentActions appointment={appointment} />,
  }));

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" row={5} />;
  }

  if (!appointments?.length) {
    return (
      <EmptyState
        headerTitle={`${t(tableHeading)} ${t('appointments_lower', 'appointments')}`}
        displayText={`${
          tableHeading?.match(/today/i)
            ? t('appointmentsScheduledForToday', 'appointments scheduled for today')
            : `${t(tableHeading)} ${t('appointments_lower', 'appointments')}`
        }`}
        launchForm={() => launchWorkspace('search-patient')}
      />
    );
  }

  return (
    <Layer className={styles.container}>
      <Tile className={styles.headerContainer}>
        <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
          <h4>{`${t(tableHeading)} ${t('appointments', 'Appointments')}`}</h4>
        </div>
      </Tile>
      <div className={styles.toolbar}>
        <Search
          className={styles.searchbar}
          labelText=""
          placeholder={t('filterTable', 'Filter table')}
          onChange={(event) => setSearchString(event.target.value)}
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
            downloadAppointmentsAsExcel(appointments, `${tableHeading}_appointments_${date}`);
          }}>
          {t('download', 'Download')}
        </Button>
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
          getTableProps,
          getTableContainerProps,
        }) => (
          <>
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const matchingAppointment = appointments.find((appointment) => appointment.uuid === row.id);
                    const patientUuid = matchingAppointment.patient?.uuid;
                    const visitDate = dayjs(matchingAppointment.startDateTime);
                    const isFutureAppointment = visitDate.isAfter(dayjs());
                    const isTodayAppointment = visitDate.isToday();
                    const hasActiveVisitToday = visits?.some(
                      (visit) => visit?.patient?.uuid === patientUuid && visit?.startDatetime,
                    );

                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                          ))}
                          <TableCell className="cds--table-column-menu">
                            {isFutureAppointment || (isTodayAppointment && !hasActiveVisitToday) ? (
                              <OverflowMenu
                                align="left"
                                aria-label={t('actions', 'Actions')}
                                flipped
                                size={responsiveSize}>
                                <OverflowMenuItem
                                  className={styles.menuItem}
                                  itemText={t('editAppointments', 'Edit appointment')}
                                  size={responsiveSize}
                                  onClick={() =>
                                    launchWorkspace('edit-appointments-form', {
                                      patientUuid: matchingAppointment.patient.uuid,
                                      appointment: matchingAppointment,
                                      context: 'editing',
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
