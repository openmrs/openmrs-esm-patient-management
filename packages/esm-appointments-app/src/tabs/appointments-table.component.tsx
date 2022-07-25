import React, { useMemo, useState } from 'react';
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
import CurrencyPound16 from '@carbon/icons-react/es/currency--pound/16';
import Omega16 from '@carbon/icons-react/es/omega/16';
import { useLayoutType, ConfigurableLink, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useAppointmentEntries } from './appointments-table.resource';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './appointments-table.scss';

function ActionsMenu() {
  const { t } = useTranslation();

  return (
    <OverflowMenu light selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#editPatientDetails"
        itemText={t('editPatientDetails', 'Edit patient details')}>
        {t('editPatientDetails', 'Edit patient details')}
      </OverflowMenuItem>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#setWaitTimeManually"
        itemText={t('setWaitTimeManually', 'Set wait time manually')}>
        {t('setWaitTimeManually', 'Set wait time manually')}
      </OverflowMenuItem>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#endVisit"
        hasDivider
        isDelete
        itemText={t('endVisit', 'End visit')}>
        {t('endVisit', 'End Visit')}
      </OverflowMenuItem>
    </OverflowMenu>
  );
}

function ServiceIcon({ service }) {
  switch (service) {
    case 'TB Clinic':
      return <CurrencyPound16 />;
    case 'HIV Clinic':
      return <Omega16 />;
    default:
      return null;
  }
}

function AppointmentsTable() {
  const { t } = useTranslation();
  const { appointmentEntries, isLoading } = useAppointmentEntries();
  const [showOverlay, setShowOverlay] = useState(false);
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
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return appointmentEntries?.map((appointment) => ({
      ...appointment,
      name: {
        content: (
          <ConfigurableLink to={`\${openmrsSpaBase}/patient/${appointment.patientUuid}/chart`}>
            {appointment.name}
          </ConfigurableLink>
        ),
      },
      dateTime: {
        content: (
          <span className={styles.statusContainer}>
            {formatDatetime(parseDate(appointment.dateTime), { mode: 'standard' })}
          </span>
        ),
      },
      serviceType: {
        content: (
          <span className={styles.statusContainer}>
            <ServiceIcon service={appointment.serviceType} />
            {appointment.serviceType}
          </span>
        ),
      },
    }));
  }, [appointmentEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (appointmentEntries?.length) {
    return (
      <div className={styles.container} data-floating-menu-container>
        <div className={styles.headerContainer}>
          <span className={styles.heading}>{t('appointments', 'Appointments')}</span>
          <Button
            size="small"
            kind="secondary"
            renderIcon={Add16}
            onClick={() => setShowOverlay(true)}
            iconDescription={t('addNewAppointment', 'Add new apppointment')}>
            {t('addNewAppointment', 'Add new apppointment')}
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
                            <ActionsMenu />
                          </TableCell>
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedAppointmentsRow} colSpan={headers.length + 2}>
                            <></>
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
                    <Button kind="ghost" size="small" renderIcon={Add16} onClick={() => setShowOverlay(true)}>
                      {t('addNewAppointment', 'Add new apppointment')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
            </TableContainer>
          )}
        </DataTable>
        {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} />}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noAppointmentsToDisplay', 'No appointments to display')}</p>
          <Button kind="ghost" size="small" renderIcon={Add16} onClick={() => setShowOverlay(true)}>
            {t('addNewAppointment', 'Add new apppointment')}
          </Button>
        </Tile>
      </div>
      {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} />}
    </div>
  );
}

export default AppointmentsTable;
