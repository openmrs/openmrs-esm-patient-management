import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
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
  parseDate,
} from '@openmrs/esm-framework';
import { ActionsMenu } from './appointment-actions.component';
import { EmptyDataIllustration } from './empty-data-illustration.component';
import { launchCheckInAppointmentModal, handleComplete } from './common';
import { SeeAllAppointmentsLink, AddAppointmentLink, ViewCalendarLink } from './links.component';
import { type Appointment } from '../types';
import { useTodaysAppointments } from './home-appointments.resource';
import { type ConfigObject } from '../config-schema';
import { formatAMPM } from '../helpers';
import styles from './appointments-base-table.scss';
import { useMutateAppointments } from '../form/appointments-form.resource';

interface PaginationData {
  goTo: (page: number) => void;
  results: Array<Appointment>;
  currentPage: number;
}

type RenderStatusProps = {
  status: string;
  t: (key: string, fallback: string) => string;
  appointmentUuid: string;
};

const RenderStatus = ({ status, t, appointmentUuid }: RenderStatusProps) => {
  const { mutateAppointments } = useMutateAppointments();
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
        <Button kind="ghost" onClick={() => handleComplete(appointmentUuid, mutateAppointments, t)}>
          {t('complete', 'Complete')}
        </Button>
      );
    default:
      return (
        <Button
          size="sm"
          kind="ghost"
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
  const { appointments, isLoading } = useTodaysAppointments();

  const fullView = userHasAccess(fullViewPrivilege, user) || !useFullViewPrivilege;
  const { customPatientChartUrl } = useConfig<ConfigObject>();

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
        header: t('dateAndTime', 'Date and time'),
        key: 'startDateTime',
        isSortable: true,
      },
      {
        id: 1,
        header: t('name', 'Patient Name'),
        key: 'name',
        isSortable: true,
      },
      {
        id: 2,
        header: t('identifier', 'Identifier'),
        key: 'identifier',
        isSortable: true,
      },
      {
        id: 3,
        header: t('location', 'Location'),
        key: 'location',
        isSortable: true,
      },
      {
        id: 4,
        header: t('service', 'Service'),
        key: 'service',
        isSortable: true,
      },
      {
        id: 5,
        header: t('actions', 'Actions'),
        key: 'actionButton',
        isSortable: false,
      },
    ],
    [t],
  );

  const tableRows = paginatedAppointments?.map((appointment) => ({
    id: appointment.uuid,
    startDateTime: {
      content: (
        <span className={styles.statusContainer}>
          <span className={styles.startTime}>{formatAMPM(parseDate(appointment.startDateTime))}</span>
        </span>
      ),
      sortKey: appointment.startDateTime,
    },
    name: {
      content: (
        <div className={styles.nameContainer}>
          <ConfigurableLink to={customPatientChartUrl} templateParams={{ patientUuid: appointment.patient.uuid }}>
            {appointment.patient.name}
          </ConfigurableLink>
        </div>
      ),
      sortKey: appointment.patient.name,
    },
    identifier: {
      content: (
        <div className={styles.nameContainer}>
          <span>{appointment.patient.identifier}</span>
        </div>
      ),
      sortKey: appointment.patient.identifier,
    },
    location: {
      content: <span className={styles.statusContainer}>{appointment.location.name}</span>,
      sortKey: appointment.location.name,
    },
    service: {
      content: <span className={styles.serviceContainer}>{appointment.service.name}</span>,
      sortKey: appointment.service.name,
    },
    actionButton: {
      content: (
        <span>
          <RenderStatus status={appointment.status} appointmentUuid={appointment.uuid} t={t} />
        </span>
      ),
    },
  }));

  const handleSorting = (
    cellA: { content: JSX.Element; sortKey: string },
    cellB: { content: JSX.Element; sortKey: string },
    {
      sortDirection,
      sortStates,
    }: {
      sortDirection: 'ASC' | 'DESC' | 'NONE';
      sortStates: { ASC: 'ASC'; DESC: 'DESC'; NONE: 'NONE' };
    },
  ) => {
    if (sortDirection === sortStates.NONE) {
      return 0;
    }

    if (sortDirection === sortStates.ASC) {
      return cellA?.sortKey?.localeCompare(cellB?.sortKey) ?? 0;
    }

    if (sortDirection === sortStates.DESC) {
      return cellB?.sortKey?.localeCompare(cellA?.sortKey) ?? 0;
    }
  };

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
          <div className={isDesktop(layout) ? styles.desktopHeading : styles.tabletHeading}>
            <h4>{t('todaysAppointments', "Today's Appointments")}</h4>
            <div className={styles.actionLink}>
              <AddAppointmentLink />
            </div>
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
          sortRow={handleSorting}
          overflowMenuOnHover={isDesktop(layout)}
          rows={tableRows}
          size={isDesktop(layout) ? 'lg' : 'sm'}
          useZebraStyles={true}>
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => {
            return (
              <TableContainer className={styles.tableContainer}>
                <Table {...getTableProps()} className={styles.appointmentsTable}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header, isSortable: header.isSortable })} key={header.id}>
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
                              <TableCell className={classNames('cds--table-column-menu', styles.overflowMenu)}>
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
            );
          }}
        </DataTable>
      </div>
      <SeeAllAppointmentsLink />
    </>
  );
};

export default AppointmentsBaseTable;
