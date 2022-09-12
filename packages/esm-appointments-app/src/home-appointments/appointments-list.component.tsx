import React, { useMemo } from 'react';
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
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Link,
} from '@carbon/react';
import { Add, WatsonHealthStatusResolved } from '@carbon/react/icons';
import { isDesktop, useLayoutType, ConfigurableLink, useConfig, navigate } from '@openmrs/esm-framework';
import { MappedAppointment } from '../types';
import { useTodayAppointments } from './appointments-table.resource';
import AppointmentDetails from '../appointment-details/appointment-details.component';
import styles from './appointments-list.scss';
import PatientSearch from '../patient-search/patient-search.component';
import { launchOverlay } from '../hooks/useOverlay';
import { EmptyDataIllustration } from './emptyData';
import { spaBasePath } from '../constants';

import { ActionsMenu } from './appointment-actions.component';

interface AppointmentsProps {
  appointments: Array<MappedAppointment>;
  isLoading: Boolean;
  tableHeading: String;
  mutate?: () => void;
}

const ServiceColor = ({ color }) => <div className={styles.serviceColor} style={{ backgroundColor: `${color}` }} />;

const AppointmentsBaseTable: React.FC<AppointmentsProps> = () => {
  const { appointmentsEnvironment } = useConfig();
  const { isLoading, appointments } = useTodayAppointments();

  const { t } = useTranslation();
  const layout = useLayoutType();

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('dateTime', 'Date and time'),
        key: 'dateTime',
      },
      {
        id: 1,
        header: t('name', 'Name / HSU'),
        key: 'name',
      },
      {
        id: 2,
        header: t('location', 'Location'),
        key: 'location',
      },
      {
        id: 3,
        header: t('service', 'Service'),
        key: 'service',
      },
      {
        id: 4,
        header: 'Actions',
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
          <span className={styles.identfier}>{appointment.identifier}</span>
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
              <WatsonHealthStatusResolved /> Completed
            </div>
          ) : appointment.status === 'CheckedIn' ? (
            <Button kind="primary" className={styles.actionButton}>
              COMPLETED
            </Button>
          ) : (
            <Button kind="primary" className={styles.actionButton}>
              CHECK IN
            </Button>
          )}
          <ActionsMenu appointment={appointment} environment={appointmentsEnvironment} />
        </span>
      ),
    },
  }));

  const AddAppointmentLink = () =>
    appointmentsEnvironment === 'OpenMRS' ? (
      <Button
        kind="ghost"
        renderIcon={(props) => <Add size={16} {...props} />}
        onClick={() => {
          navigate({ to: `${spaBasePath}` });
          launchOverlay(t('search', 'Search'), <PatientSearch />);
        }}>
        {t('addNewAppointment', 'Add new appointment')}
      </Button>
    ) : (
      <Link
        size="sm"
        target="_blank"
        className={styles.buttonLink}
        href="https://demo.mybahmni.org/appointments-v2/#/home/manage/appointments/calendar/new"
        renderIcon={(props) => <Add size={16} {...props} />}>
        {t('addNewAppointment', 'Add new appointment')}
      </Link>
    );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (appointments?.length === 0) {
    return (
      <div className={styles.homeAppointmentsContainer}>
        <Layer>
          <Tile className={styles.tile}>
            <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
              <h4>
                {appointmentsEnvironment === 'OpenMRS'
                  ? t('clinicalAppointments', 'Clinical Appointments')
                  : t('todaysAppointments', "Today's Appointments")}
              </h4>
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
          <h4>
            {appointmentsEnvironment === 'OpenMRS'
              ? t('clinicalAppointments', 'Clinical Appointments')
              : t('todaysAppointments', "Today's Appointments")}
          </h4>
        </div>
        <AddAppointmentLink />
      </div>
      <DataTable
        data-floating-menu-container
        headers={tableHeaders}
        overflowMenuOnHover={isDesktop(layout) ? true : false}
        rows={tableRows}
        size="sm"
        useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer className={styles.tableContainer}>
            <Table {...getTableProps()} className={styles.appointmentsTable}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
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
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow className={styles.expandedAppointmentsRow} colSpan={headers.length + 1}>
                          <AppointmentDetails appointment={appointments?.[index]} />
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 1} />
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 && (
              <p
                style={{
                  height: isDesktop(layout) ? '2rem' : '3rem',
                  margin: '1rem 1.5rem',
                }}
                className={`${styles.emptyRow} ${styles.bodyLong01}`}>
                {t('noAppointmentsToDisplay', 'No appointments to display')}
              </p>
            )}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default AppointmentsBaseTable;
