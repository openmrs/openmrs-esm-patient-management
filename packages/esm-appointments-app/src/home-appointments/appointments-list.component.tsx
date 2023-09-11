import React, { useMemo, useState } from 'react';
import type { KeyedMutator } from 'swr';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  Layer,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Pagination,
} from '@carbon/react';
import { CheckmarkOutline, SubtractAlt, CloseOutline } from '@carbon/react/icons';
import {
  isDesktop,
  useLayoutType,
  ConfigurableLink,
  useConfig,
  usePagination,
  useSession,
  userHasAccess,
} from '@openmrs/esm-framework';
import { ActionsMenu } from './appointment-actions.component';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { launchCheckInAppointmentModal, handleComplete } from './common';
import { SeeAllAppointmentsLink, AddAppointmentLink, ViewCalendarLink } from './links.component';
import { Appointment, MappedHomeAppointment } from '../types';
import { useTodaysAppointments } from './appointments-table.resource';
import styles from './appointments-list.scss';

interface PaginationData {
  goTo: (page: number) => void;
  results: Array<MappedHomeAppointment>;
  currentPage: number;
}

const ServiceColor = ({ color }) => <div className={styles.serviceColor} style={{ backgroundColor: `${color}` }} />;

type RenderStatusProps = {
  status: string;
  t: (key: string, fallback: string) => string;
  appointmentUuid: string;
  mutate: KeyedMutator<{
    data: Array<Appointment>;
  }>;
};

const RenderStatus = ({ status, t, appointmentUuid, mutate }: RenderStatusProps) => {
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
          size="sm"
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
  const layout = useLayoutType();
  const { user } = useSession();
  const { t } = useTranslation();
  const { useBahmniAppointmentsUI: useBahmniUI, useFullViewPrivilege, fullViewPrivilege } = useConfig();
  const { appointments, isLoading, mutate } = useTodaysAppointments();

  const fullView = userHasAccess(fullViewPrivilege, user) || !useFullViewPrivilege;

  const filteredAppointments = !fullView
    ? appointments.filter((appointment) => appointment.status === 'Scheduled')
    : appointments;

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedAppointments,
    currentPage,
  }: PaginationData = usePagination(filteredAppointments, currentPageSize);

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

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <DataTableSkeleton role="progressbar" />
      </div>
    );
  }

  if (appointments?.length === 0) {
    return (
      <Layer className={styles.container}>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{t('todaysAppointments', "Today's Appointments")}</h4>
            <AddAppointmentLink />
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t(
              'noAppointmentsScheduledForTodayToDisplay',
              'There are no appointments scheduled for today to display for this location',
            )}
            .
          </p>
        </Tile>
      </Layer>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
            <h4>{t('todaysAppointments', "Today's Appointments")}</h4>
          </div>
          <div className={styles.actionLinks}>
            <ViewCalendarLink />
            <span className={styles.divider}>|</span>
            <AddAppointmentLink />
          </div>
        </div>
        <DataTable
          data-floating-menu-container
          headers={tableHeaders}
          overflowMenuOnHover={isDesktop(layout)}
          rows={tableRows}
          size={isDesktop(layout) ? 'xs' : 'md'}
          useZebraStyles={true}>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <TableContainer className={styles.tableContainer}>
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
                          {fullView && (
                            <TableCell className={`cds--table-column-menu ${styles.overflowMenu}`}>
                              <ActionsMenu appointment={filteredAppointments?.[index]} useBahmniUI={useBahmniUI} />
                            </TableCell>
                          )}
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
                        <p className={styles.content}>{t('noAppointmentsToDisplay', 'No appointments to display')}</p>
                        <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                      </div>
                      <p className={styles.separator}>{t('or', 'or')}</p>
                      <AddAppointmentLink />
                    </Tile>
                  </Layer>
                </div>
              ) : null}
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={filteredAppointments.length}
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
