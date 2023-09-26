import React from 'react';
import { DataTableSkeleton } from '@carbon/react';
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

  const rowData = activeTickets.map((ticket, index) => ({
    id: `${index}}`,
    room: ticket.room,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
  }));

  return (
    <div>
      <PatientQueueHeader title={t('queueScreen', 'Queue screen')} />
      <div className={styles.gridFlow}>
        {rowData.map((row) => (
          <div className={styles.card} key={row.id}>
            <p className={styles.subHeader}>{t('ticketNumber', 'Ticket number')}</p>
            <p className={row.status === 'calling' ? styles.headerBlinking : styles.header}>{row.ticketNumber}</p>
            <p className={styles.subHeader}>
              {t('room', 'Room')} &nbsp; : &nbsp; {row.room}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueScreen;
