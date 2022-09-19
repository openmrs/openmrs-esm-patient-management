import React, { useEffect, useMemo, useState } from 'react';
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
  Link,
  NotificationActionButton,
  InlineNotification,
} from '@carbon/react';
import { Add, CheckmarkOutline } from '@carbon/react/icons';
import {
  isDesktop,
  useLayoutType,
  ConfigurableLink,
  useConfig,
  navigate,
  showToast,
  showNotification,
} from '@openmrs/esm-framework';
import { MappedAppointment } from '../types';
import { useTodayAppointments } from './appointments-table.resource';
import styles from './appointments-list.scss';
import PatientSearch from '../patient-search/patient-search.component';
import { launchOverlay } from '../hooks/useOverlay';
import { showActionableNotification } from '../hooks/useActionableNotification';
import { EmptyDataIllustration } from './emptyData';
import { spaBasePath } from '../constants';
import { launchCheckInAppointmentModal, handleComplete } from './common';
import { useSWRConfig } from 'swr';

import { ActionsMenu } from './appointment-actions.component';

const ServiceColor = ({ color }) => <div className={styles.serviceColor} style={{ backgroundColor: `${color}` }} />;

const AddAppointmentLink = () => {
  const { useBahmniAppointmentsUI: useBahmniUI } = useConfig();

  const { t } = useTranslation();

  return useBahmniUI ? (
    <Link
      size="md"
      target="_blank"
      className="cds--btn cds--btn--ghost"
      href="https://demo.mybahmni.org/appointments-v2/#/home/manage/appointments/calendar/new"
      renderIcon={(props) => <Add size={16} {...props} className="cds--btn__icon" />}>
      {t('addNewAppointment', 'Add new appointment')}
    </Link>
  ) : (
    <Button
      kind="ghost"
      renderIcon={(props) => <Add size={16} {...props} />}
      onClick={() => {
        navigate({ to: `${spaBasePath}` });
        launchOverlay(t('search', 'Search'), <PatientSearch />);
      }}>
      {t('addNewAppointment', 'Add new appointment')}
    </Button>
  );
};

const AppointmentsBaseTable = () => {
  const { useBahmniAppointmentsUI: useBahmniUI } = useConfig();
  const { isLoading, appointments } = useTodayAppointments();

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

  const tableRows = appointments?.map((appointment) => ({
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
          {appointment.status === 'Completed' ? (
            <div className={styles.completeIcon}>
              Completed <CheckmarkOutline />
            </div>
          ) : appointment.status === 'CheckedIn' ? (
            <Button
              kind="ghost"
              className={styles.actionButton}
              onClick={() => handleComplete(appointment.id, mutate, t)}>
              Complete
            </Button>
          ) : (
            <Button
              kind="ghost"
              className={styles.actionButton}
              disabled={appointment.status === 'CheckedIn'}
              onClick={() => launchCheckInAppointmentModal(appointment.id)}>
              Check In
            </Button>
          )}
          <ActionsMenu appointment={appointment} useBahmniUI={useBahmniUI} />
        </span>
      ),
    },
  }));

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
    <div className={styles.homeAppointmentsContainer}>
      <div className={styles.headerContainer}>
        <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('todaysAppointments', "Today's Appointments")}</h4>
        </div>
        <AddAppointmentLink />
      </div>
      <DataTable
        data-floating-menu-container
        headers={tableHeaders}
        overflowMenuOnHover={isDesktop(layout) ? true : false}
        rows={tableRows}
        size={isDesktop(layout) ? 'xs' : 'md'}
        useZebraStyles={appointments?.length > 1 ? true : false}>
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
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default AppointmentsBaseTable;
