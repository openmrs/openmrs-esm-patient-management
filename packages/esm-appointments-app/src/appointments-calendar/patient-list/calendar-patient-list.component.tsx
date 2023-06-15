import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { omrsDateFormat } from '../../constants';
import {
  DataTableSkeleton,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from '@carbon/react';
import { ExtensionSlot, formatDatetime } from '@openmrs/esm-framework';
import styles from './calenar-patient-list.scss';
import { useAppointments } from '../../appointments/appointments-table.resource';

interface CalendarPatientListProps {}

const CalendarPatientList: React.FC<CalendarPatientListProps> = () => {
  const { t } = useTranslation();
  const currentPathName: string = decodeURI(window.location.pathname);
  const serviceName = currentPathName.split('/')[7];
  const forDate = currentPathName.split('/')[6];

  const { appointments, isLoading } = useAppointments(
    '',
    dayjs(new Date(forDate).setHours(0, 0, 0, 0)).format(omrsDateFormat),
  );

  const headers = [
    {
      header: t('name', 'Patient name'),
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
  ];

  const rowData = appointments
    ?.filter(({ serviceType }) => serviceName === 'Total' || serviceName === serviceType)
    .map((appointment) => ({
      id: `${appointment.identifier}`,
      ...appointment,
      dateTime: formatDatetime(new Date(appointment.dateTime)),
    }));

  if (isLoading) {
    return (
      <>
        <DataTableSkeleton />
      </>
    );
  }

  return (
    <>
      <ExtensionSlot name="breadcrumbs-slot" />
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{serviceName === 'Total' ? 'All Services' : `${serviceName} ${t('list', 'List')}`}</h2>
        </div>
        <DataTable rows={rowData} headers={headers}>
          {({ rows, headers, getHeaderProps, getRowProps, getBatchActionProps, onInputChange }) => (
            <TableContainer title={`${t('count', 'Count')} ${rowData.length}`}>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                    onChange={onInputChange}
                  />
                </TableToolbarContent>
              </TableToolbar>
              <Table>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </>
  );
};

export default CalendarPatientList;
