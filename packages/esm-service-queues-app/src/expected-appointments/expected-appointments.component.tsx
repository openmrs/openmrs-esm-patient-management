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
import { ConfigurableLink, EmptyCardIllustration, ErrorState, formatTime, useConfig } from '@openmrs/esm-framework';
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
        status: t(appointment.status),
      })),
    [appointments, t],
  );

  const patientUuidsByRowId = useMemo(() => new Map(rows.map((row) => [row.id, row.patientUuid])), [rows]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('expectedAppointments', 'Expected appointments')} />;
  }

  if (!rows.length) {
    return (
      <Tile className={styles.emptyState}>
        <EmptyCardIllustration />
        <p className={styles.emptyStateContent}>{t('noExpectedAppointments', 'No appointments expected today')}</p>
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
              {dataRows.map((row) => (
                <TableRow key={row.id}>
                  {row.cells.map((cell) =>
                    cell.info.header === 'name' ? (
                      <TableCell key={cell.id}>
                        <ConfigurableLink
                          className={styles.nameLink}
                          to={customPatientChartUrl}
                          templateParams={{ patientUuid: patientUuidsByRowId.get(row.id) }}>
                          {cell.value}
                        </ConfigurableLink>
                      </TableCell>
                    ) : (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

export default ExpectedAppointments;
