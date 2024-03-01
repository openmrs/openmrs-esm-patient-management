import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
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
} from '@carbon/react';
import { Download } from '@carbon/react/icons';
import { ExtensionSlot, formatDate, formatDatetime } from '@openmrs/esm-framework';
import { downloadAppointmentsAsExcel } from '../../helpers/excel';
import { omrsDateFormat } from '../../constants';
import { useAppointments } from '../../hooks/useAppointments';
import styles from './calendar-patient-list.scss';

const CalendarPatientList: React.FC = () => {
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
      header: t('patientName', 'Patient name'),
      key: 'name',
    },
    {
      header: t('identifier', 'Identifier'),
      key: 'identifier',
    },
    {
      header: t('date&Time', 'Date & time'),
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
    ?.filter(({ service }) => serviceName === 'Total' || serviceName === service.name)
    .map((appointment) => ({
      id: appointment.patient.identifier,
      name: appointment.patient.name,
      identifier: appointment.patient.identifier,
      dateTime: formatDatetime(new Date(appointment.startDateTime)),
      serviceType: appointment.service.name,
      provider: appointment?.providers[0]?.name,
    }));

  if (isLoading) {
    return (
      <>
        <DataTableSkeleton data-testid="calendar-patient-list" />
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
            <TableContainer className={styles.tableContainer} title={`${t('count', 'Count')} ${rowData.length}`}>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    tabIndex={getBatchActionProps().shouldShowBatchActions ? -1 : 0}
                    onChange={onInputChange}
                  />
                  <Button
                    size="lg"
                    kind="tertiary"
                    renderIcon={(props) => <Download size={16} {...props} />}
                    onClick={() =>
                      downloadAppointmentsAsExcel(
                        appointments.filter(({ service }) => serviceName === 'Total' || serviceName === service.name),
                        `${serviceName} ${formatDate(new Date(appointments[0]?.startDateTime), {
                          year: true,
                        })}`,
                      )
                    }>
                    {t('download', 'Download')}
                  </Button>
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
