import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
  Pagination,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
} from '@carbon/react';
import {
  ConfigurableLink,
  formatDatetime,
  usePagination,
  formatDate,
  useConfig,
  parseDate,
} from '@openmrs/esm-framework';
import startCase from 'lodash-es/startCase';
import { Download } from '@carbon/react/icons';
import { EmptyState } from '../../empty-state/empty-state.component';
import { downloadAppointmentsAsExcel } from '../../helpers/excel';
import { launchOverlay } from '../../hooks/useOverlay';
import { type Appointment } from '../../types';
import { getPageSizes, useSearchResults } from '../utils';
import { type ConfigObject } from '../../config-schema';
import AppointmentDetails from '../details/appointment-details.component';
import AppointmentActions from './appointments-actions.component';
import PatientSearch from '../../patient-search/patient-search.component';
import styles from './appointments-table.scss';

interface AppointmentsTableProps {
  appointments: Array<Appointment>;
  isLoading: boolean;
  tableHeading: string;
  scheduleType?: string;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  isLoading,
  tableHeading,
  scheduleType,
}) => {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(25);
  const [searchString, setSearchString] = useState('');
  const searchResults = useSearchResults(appointments, searchString);
  const { results, goTo, currentPage } = usePagination(searchResults, pageSize);
  const { customPatientChartUrl } = useConfig<ConfigObject>();

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
      header: t('serviceType', 'Service Type'),
      key: 'serviceType',
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const rowData = results?.map((appointment, index) => ({
    id: `${index}`,
    uuid: appointment.uuid,
    patientName: (
      <ConfigurableLink
        style={{ textDecoration: 'none', maxWidth: '50%' }}
        to={customPatientChartUrl}
        templateParams={{ patientUuid: appointment.patient.uuid }}>
        {appointment.patient.name}
      </ConfigurableLink>
    ),
    nextAppointmentDate: '--',
    identifier: appointment.patient.identifier,
    dateTime: formatDatetime(new Date(appointment.startDateTime)),
    serviceType: appointment.service.name,
    provider: appointment.provider,
    actions: <AppointmentActions appointment={appointment} scheduleType={scheduleType} />,
  }));

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" row={5} />;
  }

  if (!appointments?.length) {
    return (
      <EmptyState
        headerTitle={`${tableHeading} appointments`}
        displayText={`${tableHeading.toLowerCase()} appointments`}
        launchForm={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}
        scheduleType={scheduleType}
      />
    );
  }

  return (
    <>
      <DataTable rows={rowData} headers={headerData} isSortable useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getToolbarProps, getTableContainerProps }) => (
          <TableContainer
            title={`${startCase(tableHeading)} ${t('appointment', 'appointment')}`}
            description={`${t(`Total ${appointments.length ?? 0}`)}`}
            {...getTableContainerProps()}>
            <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
              <TableToolbarContent>
                <TableToolbarSearch
                  style={{ backgroundColor: '#f4f4f4' }}
                  onChange={(event) => setSearchString(event.target.value)}
                />
                <Button
                  size="lg"
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
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded ? (
                      <TableRow className={styles.expandedActiveVisitRow}>
                        <th colSpan={headers.length + 2}>
                          <AppointmentDetails appointment={appointments[row.id]} />
                        </th>
                      </TableRow>
                    ) : (
                      <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        itemsPerPageText="Items per page:"
        page={currentPage}
        pageNumberText="Page Number"
        pageSize={pageSize}
        onChange={({ page, pageSize }) => {
          goTo(page);
          setPageSize(pageSize);
        }}
        pageSizes={getPageSizes(appointments, pageSize) ?? []}
        totalItems={appointments.length ?? 0}
      />
    </>
  );
};

export default AppointmentsTable;
