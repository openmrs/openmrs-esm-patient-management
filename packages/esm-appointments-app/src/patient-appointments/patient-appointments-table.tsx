import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  type DataTableHeader,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { type Appointment } from '../types';
import { PatientAppointmentsActionMenu } from './patient-appointments-action-menu.component';
import styles from './patient-appointments-action-menu.scss';

const pageSize = 10;

interface AppointmentTableProps {
  patientAppointments: Array<Appointment>;
  switchedView: boolean;
  setSwitchedView: (value: boolean) => void;
  patientUuid: string;
}

const PatientAppointmentsTable: React.FC<AppointmentTableProps> = ({
  patientAppointments,
  patientUuid,
  switchedView,
  setSwitchedView,
}) => {
  const { t } = useTranslation();
  const { results: paginatedAppointments, currentPage, goTo } = usePagination(patientAppointments, pageSize);
  const isTablet = useLayoutType() === 'tablet';

  useEffect(() => {
    if (switchedView && currentPage !== 1) {
      goTo(1);
    }
  }, [switchedView, goTo, currentPage]);

  const tableHeaders: Array<typeof DataTableHeader> = useMemo(
    () => [
      { key: 'date', header: t('date', 'Date') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'service', header: t('service', 'Service') },
      { key: 'status', header: t('status', 'Status') },
      { key: 'type', header: t('type', 'Type') },
      { key: 'notes', header: t('notes', 'Notes') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      paginatedAppointments?.map((appointment) => {
        return {
          id: appointment.uuid,
          date: formatDatetime(parseDate(appointment.startDateTime), { mode: 'wide' }),
          location: appointment?.location?.name ? appointment?.location?.name : '——',
          service: appointment.service.name,
          status: appointment.status,
          type: appointment.appointmentKind ? appointment.appointmentKind : '——',
          notes: appointment.comments ? appointment.comments : '——',
        };
      }),
    [paginatedAppointments],
  );

  return (
    <div>
      <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={classNames(styles.productiveHeading01, styles.text02)}
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <PatientAppointmentsActionMenu appointment={paginatedAppointments[i]} patientUuid={patientUuid} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        currentItems={paginatedAppointments.length}
        totalItems={patientAppointments.length}
        onPageNumberChange={({ page }) => {
          setSwitchedView(false);
          goTo(page);
        }}
        pageNumber={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
};

export default PatientAppointmentsTable;
