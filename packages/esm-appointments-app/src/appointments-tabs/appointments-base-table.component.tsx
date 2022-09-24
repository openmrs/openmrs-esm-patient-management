import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
  DataTableSkeleton,
  Layer,
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
} from '@carbon/react';
import { Add, Cough, Medication, Omega } from '@carbon/react/icons';
import { ConfigurableLink, showModal } from '@openmrs/esm-framework';
import { launchOverlay } from '../hooks/useOverlay';
import { MappedAppointment } from '../types';
import AppointmentDetails from '../appointment-details/appointment-details.component';
import AppointmentForm from '../appointment-forms/appointments-form.component';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './appointments-base-table.scss';
import CancelAppointment from '../appointment-forms/cancel-appointment.component';
import VisitForm from '../patient-queue/visit-form/visit-form.component';

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

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

function ActionsMenu({ appointment, mutate }: ActionMenuProps) {
  const { t } = useTranslation();

  return (
    <Layer>
      <OverflowMenu ariaLabel="Edit appointment" selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#editAppointment"
          onClick={() =>
            launchOverlay(
              t('editAppointment', 'Edit Appointment'),
              <AppointmentForm appointment={appointment} context="editing" />,
            )
          }
          itemText={t('editAppointment', 'Edit Appointment')}>
          {t('editAppointment', 'Edit Appointment')}
        </OverflowMenuItem>
        <OverflowMenuItem
          className={styles.menuItem}
          id="#cancelAppointment"
          onClick={() =>
            launchOverlay(t('cancelAppointment', 'Cancel Appointment'), <CancelAppointment appointment={appointment} />)
          }
          itemText={t('cancelAppointment', 'Cancel Appointment')}>
          {t('cancelAppointment', 'Cancel Appointment')}
        </OverflowMenuItem>
      </OverflowMenu>
    </Layer>
  );
}

function ServiceIcon({ service }) {
  switch (service) {
    case 'TB Clinic':
      return <Cough size={16} />;
    case 'HIV Clinic':
      return <Omega size={16} />;
    case 'Drug Dispense':
      return <Medication size={16} />;
    default:
      return null;
  }
}

const AppointmentsBaseTable: React.FC<AppointmentsProps> = ({ appointments, isLoading, tableHeading }) => {
  const { t } = useTranslation();

  const [filteredRows, setFilteredRows] = useState<Array<MappedAppointment>>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (filter) {
      setFilteredRows(appointments?.filter((entry) => entry.serviceType === filter));
      setFilter('');
    }
  }, [filter, filteredRows, appointments]);

  const handleServiceTypeChange = ({ selectedItem }) => {
    setFilter(selectedItem.name);
  };

  const handleFilter = ({ rowIds, headers, cellsById, inputValue, getCellId }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        if (typeof filterableValue === 'boolean') {
          return false;
        }
        if (filterableValue.hasOwnProperty('content')) {
          if (Array.isArray(filterableValue.content.props.children)) {
            return ('' + filterableValue.content.props.children[1]).toLowerCase().includes(filterTerm);
          }
          if (typeof filterableValue.content.props.children === 'object') {
            return ('' + filterableValue.content.props.children.props.children).toLowerCase().includes(filterTerm);
          }
          return ('' + filterableValue.content.props.children).toLowerCase().includes(filterTerm);
        }
        return ('' + filterableValue).toLowerCase().includes(filterTerm);
      }),
    );
  };

  const handleAppointmentActionButtonClick = (appointment: MappedAppointment) => {
    if (appointment.status === 'Scheduled') {
      launchOverlay(
        t('AddPatientToQueue', 'Add patient to queue'),
        <VisitForm patientUuid={appointment.patientUuid} appointment={appointment} />,
      );
      return;
    }

    const dispose = showModal('change-appointment-status-modal', {
      closeModal: () => dispose(),
      appointment,
    });
  };

  const tableHeaders = useMemo(
    () => [
      {
        header: t('name', 'Name'),
        key: 'name',
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
        header: t('provider', 'Provider'),
        key: 'provider',
      },
      {
        header: t('location', 'Location'),
        key: 'location',
      },
      {
        header: 'Actions',
        key: 'startButton',
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return (filteredRows.length ? filteredRows : appointments)?.map((appointment, index) => ({
      ...appointment,
      name: {
        content: (
          <ConfigurableLink
            style={{ textDecoration: 'none' }}
            to={`\${openmrsSpaBase}/patient/${appointment.patientUuid}/chart`}>
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
        content: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button onClick={() => handleAppointmentActionButtonClick(appointment)} kind="ghost">
              {appointment.status === 'Scheduled' ? t('checkedIn', 'Checked In') : t('changeStatus', 'Change status')}
            </Button>

            <ActionsMenu appointment={appointments?.[index]} />
          </div>
        ),
      },
    }));
  }, [filteredRows, appointments, t]);

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
              size="sm"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}>
              {t('addNewAppointment', 'Add new appointment')}
            </Button>
          </Tile>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DataTable rows={tableRows} headers={tableHeaders} filterRows={handleFilter}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
          getToolbarProps,
          onInputChange,
        }) => (
          <TableContainer {...getTableContainerProps()}>
            <TableToolbar size="sm" {...getToolbarProps()} aria-label="data table toolbar">
              <TableToolbarContent className={styles.tableToolBarContent}>
                <TableToolbarSearch
                  style={{ height: '2rem' }}
                  className={styles.search}
                  expanded
                  onChange={onInputChange}
                  placeholder={t('searchAppointments', 'Search appointments')}
                  size="sm"
                  id="toolBarSearch"
                />
                <Button
                  kind="secondary"
                  style={{ minHeight: 0 }}
                  renderIcon={(props) => <Add size={16} {...props} />}
                  onClick={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}
                  iconDescription={t('addNewAppointment', 'Add new appointment')}>
                  {t('addNewAppointment', 'Add new appointment')}
                </Button>
              </TableToolbarContent>
            </TableToolbar>
            <Table useZebraStyles size="sm" {...getTableProps()}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader id="expand" />
                  {headers.map((header, i) => (
                    <TableHeader key={i} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded ? (
                      <TableExpandedRow colSpan={headers.length + 2}>
                        <AppointmentDetails appointment={appointments?.[index]} />
                      </TableExpandedRow>
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
    </div>
  );
};

export default AppointmentsBaseTable;
