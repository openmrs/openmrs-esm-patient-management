import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../empty-state/empty-state.component';

import { closeOverlay, launchOverlay } from '../hooks/useOverlay';
import PatientSearch from '../patient-search/patient-search.component';
import { MappedAppointment } from '../types';
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
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { ExtensionSlot, ConfigurableLink, formatDatetime, usePagination } from '@openmrs/esm-framework';
import startCase from 'lodash-es/startCase';
import { Add } from '@carbon/react/icons';
import AppointmentDetails from '../appointment-details/appointment-details.component';
import styles from './appointments-base-table.scss';
import { handleFilter } from './utils';
import AppointmentForm from '../appointment-forms/appointments-form.component';
import CancelAppointment from '../appointment-forms/cancel-appointment.component';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
dayjs.extend(isToday);

interface AppointmentsBaseTableProps {
  appointments: Array<MappedAppointment>;
  isLoading: boolean;
  tableHeading: string;
  mutate?: () => void;
}

const AppointmentsBaseTable: React.FC<AppointmentsBaseTableProps> = ({
  appointments,
  isLoading,
  tableHeading,
  mutate,
}) => {
  const { t } = useTranslation();
  const { results, goTo, currentPage } = usePagination(appointments, 10);

  const launchCreateAppointmentForm = (patientUuid) => {
    closeOverlay();
    launchOverlay(
      t('appointmentForm', 'Create Appointment'),
      <AppointmentForm patientUuid={patientUuid} context="creating" />,
    );
  };

  const headerData = [
    {
      header: t('patientName', 'Patient name'),
      key: 'patientName',
    },
    {
      header: t('identifier', 'identifier'),
      key: 'identifier',
    },
    {
      header: t('dateTime', 'Date & Time'),
      key: 'dateTime',
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
    patientName: {
      content: (
        <ConfigurableLink
          style={{ textDecoration: 'none' }}
          to={`\${openmrsSpaBase}/patient/${appointment.patientUuid}/chart`}>
          {appointment.name}
        </ConfigurableLink>
      ),
    },
    identifier: appointment.identifier,
    dateTime: formatDatetime(new Date(appointment.dateTime)),
    serviceType: appointment.serviceType,
    provider: appointment.provider,
    actions: (
      <>
        {(dayjs(appointment.dateTime).isAfter(dayjs()) || dayjs(appointment.dateTime).isToday()) && (
          <OverflowMenu size="sm" flipped>
            <OverflowMenuItem
              itemText={t('editAppointments', 'Edit Appointment')}
              onClick={() =>
                launchOverlay(
                  t('editAppointments', 'Edit Appointment'),
                  <AppointmentForm appointment={appointment} context="editing" />,
                )
              }
            />
            <OverflowMenuItem
              itemText={t('cancelAppointment', 'Cancel appointment')}
              onClick={() =>
                launchOverlay(
                  t('cancelAppointment', 'Cancel appointment'),
                  <CancelAppointment appointment={appointment} />,
                )
              }
            />
          </OverflowMenu>
        )}
      </>
    ),
  }));

  const pageSizes = useMemo(() => {
    const numberOfPages = Math.ceil(appointments.length / 10);
    return [...Array(numberOfPages).keys()].map((x) => {
      return (x + 1) * 10;
    });
  }, [appointments]);
  if (isLoading) {
    return <DataTableSkeleton role="progressbar" row={5} />;
  }

  if (!appointments?.length) {
    return (
      <EmptyState
        headerTitle={`${tableHeading} appointments`}
        displayText={`${tableHeading} appointments`}
        launchForm={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}
      />
    );
  }

  return (
    <div className={styles.appointmentBaseTable}>
      <div className={styles.addAppointmentButton}>
        <ExtensionSlot
          extensionSlotName="patient-search-button-slot"
          state={{
            selectPatientAction: launchCreateAppointmentForm,
            buttonText: t('createNewAppointment', 'Create new appointment'),
            overlayHeader: t('createNewAppointment', 'Create new appointment'),
            buttonProps: {
              kind: 'secondary',
              size: 'sm',
              renderIcon: (props) => <Add size={20} {...props} />,
            },
          }}
        />
      </div>
      <DataTable rows={rowData} headers={headerData} isSortable filterRows={handleFilter}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getBatchActionProps, onInputChange }) => (
          <TableContainer
            title={`${startCase(tableHeading)} ${t('appointments', 'appointment')} ${appointments.length ?? 0}`}>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch style={{ backgroundColor: '#f4f4f4' }} tabIndex={0} onChange={onInputChange} />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} size="sm" useZebraStyles>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell className="cds--table-column-menu" key={cell.id}>
                          {cell.value?.content ?? cell.value}
                        </TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded && (
                      <TableExpandedRow colSpan={headers.length + 1}>
                        <AppointmentDetails appointment={results[index]} />
                      </TableExpandedRow>
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
        pageSize={10}
        onChange={({ page }) => goTo(page)}
        pageSizes={pageSizes}
        totalItems={appointments.length ?? 0}
      />
    </div>
  );
};

export default AppointmentsBaseTable;
