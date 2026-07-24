import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { ConfigurableLink, formatTime, useConfig } from '@openmrs/esm-framework';
import { useExpectedAppointments } from '../hooks/useExpectedAppointments';
import { useServiceQueuesStore } from '../store/store';
import { type ConfigObject } from '../config-schema';
import styles from './expected-appointments.scss';

const ExpectedAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { customPatientChartUrl } = useConfig<ConfigObject>();
  const { selectedQueueLocationUuid } = useServiceQueuesStore();
  const { appointments, isLoading, error } = useExpectedAppointments(selectedQueueLocationUuid);

  const headers = useMemo(
    () => [
      { key: 'name', header: t('name', 'Name') },
      { key: 'service', header: t('service', 'Service') },
      { key: 'time', header: t('time', 'Time') },
      { key: 'status', header: t('status', 'Status') },
    ],
    [t],
  );

  const rows = useMemo(
    () =>
      appointments.map((appointment) => ({
        id: appointment.uuid,
        patientUuid: appointment.patient.uuid,
        name: appointment.patient.name,
        service: appointment.service?.name ?? '--',
        time: appointment.startDateTime ? formatTime(new Date(appointment.startDateTime)) : '--',
        status: appointment.status,
      })),
    [appointments],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error || !rows.length) {
    return (
      <Tile className={styles.emptyState}>
        <p className={styles.emptyStateTitle}>
          {error
            ? t('errorLoadingAppointments', 'Error loading appointments')
            : t('noExpectedAppointments', 'No appointments expected today')}
        </p>
      </Tile>
    );
  }

  return (
    <DataTable headers={headers} rows={rows} useZebraStyles>
      {({ rows: dataRows, headers: dataHeaders, getHeaderProps, getTableProps }) => (
        <TableContainer>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {dataHeaders.map((header) => {
                  const { key, ...headerProps } = getHeaderProps({ header });
                  return (
                    <TableHeader key={key} {...headerProps}>
                      {header.header}
                    </TableHeader>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataRows.map((row) => {
                const appointmentRow = rows.find((r) => r.id === row.id);
                return (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) =>
                      cell.info.header === 'name' ? (
                        <TableCell key={cell.id}>
                          <ConfigurableLink
                            className={styles.nameLink}
                            to={customPatientChartUrl}
                            templateParams={{ patientUuid: appointmentRow?.patientUuid }}>
                            {cell.value}
                          </ConfigurableLink>
                        </TableCell>
                      ) : (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ),
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

export default ExpectedAppointments;
