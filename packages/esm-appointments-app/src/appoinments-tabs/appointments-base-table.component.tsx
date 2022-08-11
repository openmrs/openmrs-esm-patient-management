import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
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
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from 'carbon-components-react';
import Add16 from '@carbon/icons-react/es/add/16';
import Omega16 from '@carbon/icons-react/es/omega/16';
import Cough16 from '@carbon/icons-react/es/cough/16';
import Medication16 from '@carbon/icons-react/es/medication/16';
import { useLayoutType, ConfigurableLink } from '@openmrs/esm-framework';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './appointments-base-table.scss';
import { MappedAppointment } from '../types';
import { launchOverlay } from '../hooks/useOverlay';
import AppointmentDetails from '../appointment-details/appointment-details.component';
import AppointmentForm from '../appointment-forms/appointment-form.component';

interface AppointmentsProps {
  appointments: Array<MappedAppointment>;
  isLoading: Boolean;
  tableHeading: String;
  mutate?: () => void;
}

interface ActionMenuProps {
  appointment: MappedAppointment;
  mutate?: () => void;
}

const ActionsMenu: React.FC<ActionMenuProps> = ({ appointment, mutate }) => {
  const { t } = useTranslation();

  return (
    <OverflowMenu light selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#editAppointment"
        onClick={() =>
          launchOverlay(
            t('editAppointment', 'Edit Appointment'),
            <AppointmentForm mutate={mutate} appointment={appointment} />,
          )
        }
        itemText={t('editAppointment', 'Edit Appointment')}>
        {t('editAppointment', 'Edit Appointment')}
      </OverflowMenuItem>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#cancelAppointment"
        itemText={t('cancelAppointment', 'Cancel Appointment')}>
        {t('cancelAppointment', 'Cancel Appointment')}
      </OverflowMenuItem>
    </OverflowMenu>
  );
};

function ServiceIcon({ service }) {
  switch (service) {
    case 'TB Clinic':
      return <Cough16 />;
    case 'HIV Clinic':
      return <Omega16 />;
    case 'Drug Dispense':
      return <Medication16 />;
    default:
      return null;
  }
}

const AppointmentsBaseTable: React.FC<AppointmentsProps> = ({ appointments, isLoading, tableHeading, mutate }) => {
  const { t } = useTranslation();
  const isDesktop = useLayoutType() === 'desktop';

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('dateTime', 'Date & Time'),
        key: 'dateTime',
      },
      {
        id: 2,
        header: t('serviceType', 'Service Type'),
        key: 'serviceType',
      },
      {
        id: 3,
        header: t('provider', 'Provider'),
        key: 'provider',
      },
      {
        id: 4,
        header: t('location', 'Location'),
        key: 'location',
      },
      {
        id: 5,
        header: '',
        key: 'startButton',
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return appointments?.map((appointment) => ({
      ...appointment,
      name: {
        content: (
          <ConfigurableLink to={`\${openmrsSpaBase}/patient/${appointment.patientUuid}/chart`}>
            {appointment.name}
          </ConfigurableLink>
        ),
      },
      dateTime: {
        content: <span className={styles.statusContainer}>{appointment.dateTime}</span>,
      },
      serviceType: {
        content: (
          <span className={styles.statusContainer}>
            <ServiceIcon service={appointment.serviceType} />
            {appointment.serviceType}
          </span>
        ),
      },
      startButton: {
        content: <Button kind="ghost">Start</Button>,
      },
    }));
  }, [appointments]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (appointments?.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.tileContainer}>
          <Tile className={styles.tile}>
            <p className={styles.content}>{t('noAppointmentsToDisplay', 'No appointments to display')}</p>
            <Button
              kind="ghost"
              size="small"
              renderIcon={Add16}
              onClick={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}>
              {t('addNewAppointment', 'Add new Appointment')}
            </Button>
          </Tile>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-floating-menu-container>
      <div className={styles.headerContainer}>
        <span className={styles.heading}>{tableHeading}</span>
        <Button
          size="small"
          kind="secondary"
          renderIcon={Add16}
          onClick={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}
          iconDescription={t('addNewAppointment', 'Add new Appointment')}>
          {t('addNewAppointment', 'Add new Appointment')}
        </Button>
      </div>
      <DataTable
        headers={tableHeaders}
        overflowMenuOnHover={isDesktop ? true : false}
        rows={tableRows}
        size="compact"
        useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  className={styles.search}
                  expanded
                  light
                  onChange={onInputChange}
                  placeholder={t('searchThisList', 'Search this list')}
                  size="sm"
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} className={styles.appointmentsTable}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                  <TableExpandHeader />
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
                        <TableCell className="bx--table-column-menu">
                          <ActionsMenu appointment={appointments?.[index]} />
                        </TableCell>
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow className={styles.expandedAppointmentsRow} colSpan={headers.length + 2}>
                          <AppointmentDetails appointment={appointments?.[index]} />
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noAppointmentsToDisplay', 'No appointments to display')}</p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                  <p className={styles.separator}>{t('or', 'or')}</p>
                  <Button
                    kind="ghost"
                    size="small"
                    renderIcon={Add16}
                    onClick={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}>
                    {t('addNewAppointment', 'Add new Appointment')}
                  </Button>
                </Tile>
              </div>
            ) : null}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default AppointmentsBaseTable;
