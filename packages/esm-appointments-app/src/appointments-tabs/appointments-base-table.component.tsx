import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
  DataTableSkeleton,
  Dropdown,
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
import { isDesktop, useLayoutType, ConfigurableLink, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { launchOverlay } from '../hooks/useOverlay';
import { MappedAppointment } from '../types';
import { useServices } from './appointments-table.resource';
import AppointmentDetails from '../appointment-details/appointment-details.component';
import AppointmentForm from '../appointment-forms/edit-appointment-form.component';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './appointments-base-table.scss';

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
            launchOverlay(t('editAppointment', 'Edit Appointment'), <AppointmentForm appointment={appointment} />)
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
  const layout = useLayoutType();
  const { services } = useServices();
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
            return ('' + filterableValue.content.props.children[1].props.children).toLowerCase().includes(filterTerm);
          }
          if (typeof filterableValue.content.props.children === 'object') {
            return ('' + filterableValue.content.props.children.props.children.props.children)
              .toLowerCase()
              .includes(filterTerm);
          }
          return ('' + filterableValue.content.props.children).toLowerCase().includes(filterTerm);
        }
        return ('' + filterableValue).toLowerCase().includes(filterTerm);
      }),
    );
  };

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
    return (filteredRows.length ? filteredRows : appointments)?.map((appointment) => ({
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
  }, [filteredRows, appointments]);

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
      <div className={styles.headerContainer}>
        <span className={styles.heading}>{tableHeading}</span>
        <Button
          size="sm"
          kind="secondary"
          renderIcon={(props) => <Add size={16} {...props} />}
          onClick={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}
          iconDescription={t('addNewAppointment', 'Add new appointment')}>
          {t('addNewAppointment', 'Add new appointment')}
        </Button>
      </div>
      <DataTable
        data-floating-menu-container
        filterRows={handleFilter}
        headers={tableHeaders}
        overflowMenuOnHover={isDesktop(layout) ? true : false}
        rows={tableRows}
        size="sm"
        useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar style={{ position: 'static', height: '3rem', overflow: 'visible', backgroundColor: 'color' }}>
              <TableToolbarContent className={styles.toolbarContent}>
                <Dropdown
                  id="serviceFilter"
                  initialSelectedItem={{ name: 'All' }}
                  label=""
                  titleText={t('selectedService', 'Selected service ') + ':'}
                  type="inline"
                  items={[{ name: 'All' }, ...services]}
                  itemToString={(item) => (item ? item.name : '')}
                  onChange={handleServiceTypeChange}
                  size="sm"
                />
                <Layer>
                  <TableToolbarSearch
                    className={styles.search}
                    expanded
                    onChange={onInputChange}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  />
                </Layer>
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
                        <TableCell className="cds--table-column-menu">
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
                <Layer>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noAppointmentsToDisplay', 'No appointments to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={() => launchOverlay(t('search', 'Search'), <PatientSearch />)}>
                      {t('addNewAppointment', 'Add new appointment')}
                    </Button>
                  </Tile>
                </Layer>
              </div>
            ) : null}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default AppointmentsBaseTable;
