import React, { useEffect } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useActiveTickets } from './useActiveTickets';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import styles from './queue-screen.scss';

interface QueueScreenProps {}

const QueueScreen: React.FC<QueueScreenProps> = () => {
  const { t } = useTranslation();
  const { activeTickets, isLoading, error } = useActiveTickets();

  if (isLoading) {
    return <DataTableSkeleton row={5} className={styles.queueScreen} role="progressbar" />;
  }

  if (error) {
    return <div>Error</div>;
  }

  const headerData = [
    {
      header: t('room', 'Room'),
      key: 'room',
    },
    {
      header: t('ticketNumber', 'Ticket Number'),
      key: 'ticketNumber',
    },
    {
      header: t('status', 'Status'),
      key: 'status',
    },
  ];

  const rowData = activeTickets.map((ticket, index) => ({
    id: `${index}}`,
    room: ticket.room,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
  }));

  return (
    <div>
      <PatientQueueHeader />
      <div className={styles.queueScreen}>
        <DataTable rows={rowData} headers={headerData} isSortable>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer title={t('activeTickets', 'Active tickets')}>
              <Table {...getTableProps()} size="lg" useZebraStyles>
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
    </div>
  );
};

export default QueueScreen;
