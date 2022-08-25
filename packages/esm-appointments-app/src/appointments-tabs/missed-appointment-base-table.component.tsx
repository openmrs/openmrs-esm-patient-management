import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
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
  DataTableHeader,
  Dropdown,
} from '@carbon/react';
import { Add, Cough, Medication, Omega } from '@carbon/react/icons';
import { isDesktop, useLayoutType, ConfigurableLink, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { launchOverlay } from '../hooks/useOverlay';
import { MappedAppointment } from '../types';
import AppointmentDetails from '../appointment-details/appointment-details.component';
import AppointmentForm from '../appointment-forms/edit-appointment-form.component';
import styles from './appointments-base-table.scss';
import { useServices } from './appointments-table.resource';
interface AppointmentsProps {
  appointments: Array<MappedAppointment>;
  isLoading: Boolean;
  tableHeading: String;
  paragraph?: String;
}

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface ActionMenuProps {
  appointment: MappedAppointment;
  mutate?: () => void;
}

const ActionsMenu: React.FC<ActionMenuProps> = ({ appointment, mutate }) => {
  const { t } = useTranslation();

  return (
    <OverflowMenu light selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
      <OverflowMenuItem className={styles.menuItem} id="#followUp" itemText={t('followUp', 'Follow up')}>
        {t('followUp', 'Follow up')}
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
      return <Cough size={16} />;
    case 'HIV Clinic':
      return <Omega size={16} />;
    case 'Drug Dispense':
      return <Medication size={16} />;
    default:
      return null;
  }
}

const MissedAppointmentsBaseTable: React.FC<AppointmentsProps> = ({
  appointments,
  isLoading,
  tableHeading,
  paragraph,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [filteredRows, setFilteredRows] = useState<Array<MappedAppointment>>([]);
  const [filter, setFilter] = useState('');
  const { services } = useServices();

  useEffect(() => {
    if (filter) {
      setFilteredRows(appointments?.filter((entry) => entry.serviceType === filter));
      setFilter('');
    }
  }, [filter, filteredRows, appointments]);

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

  const handleServiceTypeChange = ({ selectedItem }) => {
    setFilter(selectedItem.name);
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
        header: t('gender', 'Gender'),
        key: 'gender',
      },
      {
        id: 2,
        header: t('age', 'Age'),
        key: 'age',
      },
      {
        id: 3,
        header: t('serviceType', 'Last Visit'),
        key: 'serviceType',
      },
      {
        id: 4,
        header: t('startDateTime', 'Tracing attempt #1'),
        key: 'startDateTime',
      },
      {
        id: 5,
        header: t('end_date', 'Tracing Attempt #2'),
        key: 'end_date',
      },
      {
        id: 6,
        header: t('phoneNumber', 'Phone'),
        key: 'phoneNumber',
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
      age: {
        content: <span className={styles.statusContainer}>{appointment.age}</span>,
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
            <p className={styles.content}>{t('noAppointmentsToDisplay', 'No Missed appointments to display')}</p>
          </Tile>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <span className={styles.heading}>{tableHeading}</span>
      </div>
      <div className={styles.headerContainer}>
        <span className={styles.heading}>{paragraph}</span>
      </div>
      <DataTable
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
                      <p className={styles.content}>
                        {t('noAppointmentsToDisplay', 'No Missed appointments to display')}
                      </p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
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

export default MissedAppointmentsBaseTable;
