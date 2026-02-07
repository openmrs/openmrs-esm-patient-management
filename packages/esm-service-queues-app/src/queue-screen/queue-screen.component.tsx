import React from 'react';
import { DataTableSkeleton, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { EmptyCardIllustration, ErrorState } from '@openmrs/esm-framework';
import { useActiveTickets } from './useActiveTickets';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import styles from './queue-screen.scss';

const QueueScreen: React.FC = () => {
  const { t } = useTranslation();
  const { activeTickets, isLoading, error } = useActiveTickets();

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} className={styles.queueScreen} data-testid="queue-screen-skeleton" />;
  }

  const rowData = activeTickets.map((ticket) => ({
    id: ticket.room,
    room: ticket.room,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
  }));

  return (
    <div>
      <PatientQueueHeader title={t('queueScreen', 'Queue screen')} showFilters />
      {error ? (
        <div className={styles.errorState}>
          <ErrorState error={error} headerTitle={t('queueScreen', 'Queue screen')} />
        </div>
      ) : rowData.length === 0 ? (
        <Tile className={styles.emptyState}>
          <EmptyCardIllustration />
          <p className={styles.emptyStateContent}>{t('noActiveTickets', 'No active tickets to display')}</p>
        </Tile>
      ) : (
        <div className={styles.gridFlow}>
          {rowData.map((row) => (
            <div className={styles.card} key={row.id}>
              <p className={styles.subheader}>{t('ticketNumber', 'Ticket number')}</p>
              <p className={row.status === 'calling' ? styles.headerBlinking : styles.header}>{row.ticketNumber}</p>
              <p className={styles.subheader}>
                {t('room', 'Room')} &nbsp; : &nbsp; {row.room}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueScreen;
