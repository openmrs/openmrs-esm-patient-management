import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
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
import { Download } from '@carbon/icons-react';
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
} from '@openmrs/esm-framework';
import { EmptyState } from '../../empty-state/empty-state.component';
import { exportAppointmentsToSpreadsheet } from '../../helpers/excel';
import { useTodaysVisits } from '../../hooks/useTodaysVisits';
import { type Appointment } from '../../types';
import { type ConfigObject } from '../../config-schema';
import { getPageSizes, useAppointmentSearchResults } from '../utils';
import AppointmentActions from './appointments-actions.component';
import AppointmentDetails from '../details/appointment-details.component';
import styles from './appointments-table.scss';
import { launchCreateAppointmentForm } from '../../helpers';

dayjs.extend(utc);
dayjs.extend(isToday);

interface AppointmentsTableProps {
  appointments: Array<Appointment>;
  isLoading: boolean;
  tableHeading: string;
  hasActiveFilters?: boolean;
  statusDropdownItems?: Array<{ id: string; name: string; display: string }>;
  selectedStatusItem?: { id: string; name: string; display: string } | null;
  onStatusChange?: ({ selectedItem }: { selectedItem: any }) => void;
  responsiveSize?: string;
}
const AppointmentsTable = memo(function AppointmentsTable({
  appointments,
  isLoading,
  tableHeading,
  hasActiveFilters,
  statusDropdownItems = [],
  selectedStatusItem,
  onStatusChange,
  responsiveSize: providedResponsiveSize,
}: AppointmentsTableProps) {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState('');
  const config = useConfig<ConfigObject>();
  const { appointmentsTableColumns } = config;
  const layout = useLayoutType();
  const responsiveSize = providedResponsiveSize || (isDesktop(layout) ? 'sm' : 'lg');

  const searchResults = useAppointmentSearchResults(appointments, searchString);
  const { results, goTo, currentPage } = usePagination(searchResults, pageSize);
  const { visits } = useTodaysVisits();
  const { customPatientChartUrl, patientIdentifierType } = useConfig<ConfigObject>();

  const headerData = appointmentsTableColumns.map((col) => ({
    key: col,
    header: t(col, col),
  }));

  const rowData = results.map((appointment) => {
    const patientUuid = appointment.patient.uuid;
    const visitDate = dayjs(appointment.startDateTime);
    const isFuture = visitDate.isAfter(dayjs());
    const isToday = visitDate.isToday();
    const hasActiveVisit = visits?.some((v) => v.patient.uuid === patientUuid && v.startDatetime);

    return {
      id: appointment.uuid,
      patientName: (
        <ConfigurableLink className={styles.link} to={customPatientChartUrl} templateParams={{ patientUuid }}>
          {appointment.patient.name}
        </ConfigurableLink>
      ),
      identifier: patientIdentifierType
        ? (appointment.patient[patientIdentifierType.replaceAll(' ', '')] ?? appointment.patient.identifier)
        : appointment.patient.identifier,
      dateTime: formatDatetime(parseDate(appointment.startDateTime)),
      serviceType: appointment.service.name,
      location: appointment.location?.name ?? '--',
      provider: appointment.providers?.[0]?.name ?? '--',
      status: <AppointmentActions appointment={appointment} />,
      _appointment: appointment, // for expansion
      _canEdit: isFuture || (isToday && !hasActiveVisit),
    };
  });

  return (
    <Layer className={styles.container}>
      <Tile className={styles.headerContainer}>
        <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
          <h4>{`${t(tableHeading)} ${t('appointments', 'Appointments')}`}</h4>
        </div>
      </Tile>
      <div className={styles.toolbar}>
        <Search
          size={responsiveSize}
          placeholder={t('searchPatient', 'Search patient')}
          labelText=""
          onChange={(e) => setSearchString(e.target.value)}
          className={styles.searchbar}
        />

        {statusDropdownItems.length > 0 && onStatusChange && (
          <div className={styles.filterContainer}>
            <Dropdown
              id="statusFilter"
              items={statusDropdownItems}
              itemToString={(item) => item?.display ?? ''}
              label={selectedStatusItem?.display || statusDropdownItems[0]?.display || t('all', 'All')}
              selectedItem={selectedStatusItem || statusDropdownItems[0]}
              onChange={onStatusChange}
              type="inline"
              size={responsiveSize}
              titleText={t('filterByStatus', 'Filter by status')}
            />
          </div>
        )}

        <Button
          kind="tertiary"
          renderIcon={Download}
          size={responsiveSize}
          onClick={() => {
            const date = appointments[0]?.startDateTime
              ? formatDate(parseDate(appointments[0].startDateTime), { time: false, noToday: true })
              : '';
            exportAppointmentsToSpreadsheet(appointments, rowData, `${tableHeading}_appointments_${date}`);
          }}>
          {t('download', 'Download')}
        </Button>
      </div>

      {isLoading ? (
        <DataTableSkeleton row={5} />
      ) : (
        <DataTable
          key={selectedStatusItem?.id || 'all'}
          rows={rowData}
          headers={headerData}
          isSortable
          size={responsiveSize}
          useZebraStyles>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader>{t('actions', 'Actions')}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + 2}>
                        <EmptyState
                          headerTitle={t('noAppointments', 'No appointments')}
                          displayText={t('appointmentsToDisplay', 'appointments to display')}
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                          <TableCell className="cds--table-column-menu">
                            {row.cells._canEdit && (
                              <OverflowMenu flipped>
                                <OverflowMenuItem
                                  itemText={t('editAppointment', 'Edit appointment')}
                                  onClick={() =>
                                    launchWorkspace2('appointments-form-workspace', {
                                      appointment: row.cells._appointment,
                                      patientUuid: row.cells._appointment.patient.uuid,
                                      context: 'editing',
                                    })
                                  }
                                />
                              </OverflowMenu>
                            )}
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded && (
                          <TableExpandedRow colSpan={headers.length + 2} className={styles.expandedRow}>
                            <AppointmentDetails appointment={row.cells._appointment} />
                          </TableExpandedRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      )}

      {!isLoading && appointments.length > 0 && (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          pageSizes={getPageSizes(appointments, pageSize) ?? [10, 25, 50]}
          totalItems={searchResults.length}
          onChange={({ page, pageSize }) => {
            goTo(page);
            setPageSize(pageSize);
          }}
        />
      )}
    </Layer>
  );
});

export default AppointmentsTable;
