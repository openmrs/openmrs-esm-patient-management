import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVisits } from '../hooks/useVisits';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from '@carbon/react';
import { useAppointments } from './appointments-table.resource';
import { ConfigurableLink, formatDatetime } from '@openmrs/esm-framework';

const UnScheduledAppointments: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading: isVisitLoading, visits } = useVisits();
  const { appointments, isLoading } = useAppointments();
  const patientUuids = appointments?.map(({ patientUuid }) => patientUuid);
  const filteredAppointment = !isVisitLoading
    ? visits?.filter((visit) => !patientUuids.includes(visit.patient.uuid))
    : [];
  const headerData = [
    {
      header: 'Name',
      key: 'name',
    },
    {
      header: 'Start date & time',
      key: 'startDateTime',
    },
    {
      header: 'Visit Type',
      key: 'visitType',
    },
    {
      header: 'Location',
      key: 'location',
    },
  ];

  const rowData = filteredAppointment?.map((visit) => ({
    id: `${visit.uuid}`,
    name: (
      <ConfigurableLink
        style={{ textDecoration: 'none' }}
        to={`\${openmrsSpaBase}/patient/${visit.patient.uuid}/chart`}>
        {visit.patient['person'].display}
      </ConfigurableLink>
    ),
    startDateTime: formatDatetime(new Date(visit.startDatetime), { mode: 'wide' }),
    visitType: visit.visitType.display,
    location: visit.location.display,
  }));
  return (
    <div>
      <DataTable rows={rowData} headers={headerData} isSortable>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer title={`${t('unScheduledAppointments', 'UnScheduled appointments')} ${rowData.length}`}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
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
  );
};

export default UnScheduledAppointments;
