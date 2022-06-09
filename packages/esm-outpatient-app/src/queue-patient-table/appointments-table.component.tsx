import React, { useMemo, useCallback, MouseEvent, AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableHeader,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  Button,
  Tag,
} from 'carbon-components-react';
import {
  useLayoutType,
  navigate,
  showModal,
  interpolateUrl,
  ExtensionSlot,
  formatDatetime,
  parseDate,
  usePagination,
} from '@openmrs/esm-framework';
import { useAppointments } from './queue-patient.resource';
import styles from './queue-patient-table.scss';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import { mockAppointmentsData } from '../../__mocks__/appointments.mock';
import { Close16, Filter16 } from '@carbon/icons-react';

type FilterProps = {
  rowIds: Array<string>;
  headers: Array<DataTableHeader>;
  cellsById: any;
  inputValue: string;
  getCellId: (row, key) => string;
};

interface NameLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  from: string;
}

interface QueuePatientTableProps {
  title: string;
  patientData: Array<any>;
}

const PatientNameLink: React.FC<NameLinkProps> = ({ from, to, children }) => {
  const handleNameClick = (event: MouseEvent, to: string) => {
    event.preventDefault();
    navigate({ to });
    localStorage.setItem('fromPage', from);
  };

  return (
    <a onClick={(e) => handleNameClick(e, to)} href={interpolateUrl(to)}>
      {children}
    </a>
  );
};

function ActionsMenu({ patientUuid }: { patientUuid: string }) {
  const { t } = useTranslation();

  const launchEndVisitModal = useCallback(() => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    <OverflowMenu light selectorPrimaryFocus={'#editPatientDetails'} size="sm" flipped>
      <OverflowMenuItem
        className={styles.menuItem}
        id="#editPatientDetails"
        itemText={t('editPatientDetails', 'Edit patient details')}
        onClick={() =>
          navigate({
            to: `\${openmrsSpaBase}/patient/${patientUuid}/edit`,
          })
        }>
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
        onClick={launchEndVisitModal}
        hasDivider
        isDelete
        itemText={t('endVisit', 'End visit')}>
        {t('endVisit', 'End Visit')}
      </OverflowMenuItem>
    </OverflowMenu>
  );
}

const pageSize = 20;

const AppointmentsTable: React.FC<QueuePatientTableProps> = () => {
  const { t } = useTranslation();
  const { appointmentQueueEntries, isLoading } = useAppointments();
  const isDesktop = useLayoutType() === 'desktop';
  const { results: paginatedAppointments, currentPage, goTo } = usePagination(mockAppointmentsData.data, pageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: 1,
        header: t('returnDate', 'Return Date'),
        key: 'returnDate',
      },
      {
        id: 2,
        header: t('gender', 'Gender'),
        key: 'gender',
      },
      {
        id: 3,
        header: t('age', 'Age'),
        key: 'age',
      },
      {
        id: 4,
        header: t('visitType', 'Visit Type'),
        key: 'visitType',
      },
      {
        id: 5,
        header: t('phoneNumber', 'Phone Number'),
        key: 'phoneNumber',
      },
    ],
    [t],
  );

  // const tableRows = useMemo(() => {
  //   return paginatedAppointments?.map((entry) => ({
  //     ...entry,
  //     name: {
  //       content: (
  //         <PatientNameLink to={`\${openmrsSpaBase}/patient/${entry}/chart`} from={fromPage}>
  //           {/* {entry.name} */}
  //           Jane Amstrong
  //         </PatientNameLink>
  //       ),
  //     },
  //     returnDate: {
  //       content: <p>Today {entry.startDateTime}</p>,
  //     },
  //     gender: {
  //       content: <p>F</p>,
  //     },
  //     age: {
  //       content: (
  //         <p>
  //           {/* {entry.age} */}
  //           23
  //         </p>
  //       ),
  //     },
  //     visitType: {
  //       content: (
  //         <p>
  //           Adult HIV return visit
  //           {/* {entry.dob} */}
  //         </p>
  //       ),
  //     },
  //     phoneNumber: {
  //       content: <p>0702456789</p>,
  //     },
  //   }));
  // }, [appointmentQueueEntries]);

  const tableRows = useMemo(
    () =>
      paginatedAppointments?.map((appointment) => {
        return {
          id: appointment.uuid,
          name: appointment.patient.name,
          returnDate: formatDatetime(parseDate(appointment.startDateTime.toString()), { mode: 'wide' }),
          gender: appointment.patient.gender,
          age: appointment.patient.age,
          visitType: appointment.appointmentKind,
          phoneNumber: appointment.patient.phone_number,
        };
      }),
    [paginatedAppointments],
  );

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

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <div className={styles.container}>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" className={styles.breadcrumbsSlot} />

      <div className={styles.headerContainer}>
        <div>
          <p className={styles.title}>{t('scheduledAppointmentsList', 'Scheduled appointments patient list')}</p>
          <p className={styles.subTitle}>
            {mockAppointmentsData.data?.length} · Last Updated: {formatDatetime(new Date(), { mode: 'standard' })}
          </p>
        </div>

        <Button kind="ghost" size="small" renderIcon={OverflowMenuVertical16}>
          {t('actions', 'Actions')}
        </Button>
      </div>

      <Tile className={styles.filterTile}>
        <Tag size="md" title="Clear Filter" type="blue">
          {t('today', 'Today')}
        </Tag>

        <div className={styles.actionsBtn}>
          <Button renderIcon={Filter16} kind="ghost">
            {t('filter', 'Filter (1)')}
          </Button>
        </div>
      </Tile>

      {paginatedAppointments?.length ? (
        <DataTable
          data-floating-menu-container
          filterRows={handleFilter}
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
              <Table {...getTableProps()} className={styles.activeVisitsTable}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
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
                          <TableCell className="bx--table-column-menu">
                            <ActionsMenu patientUuid={tableRows?.[index]?.id} />
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </TableContainer>
          )}
        </DataTable>
      ) : (
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
        </Tile>
      )}
    </div>
  );
};

export default AppointmentsTable;
