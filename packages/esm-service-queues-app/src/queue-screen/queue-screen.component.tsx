import React, { useState, useEffect, useCallback } from 'react';
import { DataTableSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useActiveTickets } from './useActiveTickets';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import styles from './queue-screen.scss';
import { useSelectedQueueLocationUuid } from '../helpers/helpers';
import { ErrorState } from '@openmrs/esm-framework';

interface QueueScreenProps {}

const QueueScreen: React.FC<QueueScreenProps> = () => {
  const { t } = useTranslation();
  const { activeTickets, isLoading, error, mutate } = useActiveTickets();
  const speaker = window.speechSynthesis;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const selectedLocation = useSelectedQueueLocationUuid();
  const locationFilteredTickets = activeTickets;

  const rowData = locationFilteredTickets.map((ticket, index) => ({
    id: `${index}`,
    room: ticket.room,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
  }));
  const readTicket = useCallback(
    (queue) => {
      if ('speechSynthesis' in window) {
        const message = new SpeechSynthesisUtterance();
        const [prefix, suffix] = queue.ticketNumber.split('-');
        // const utterance = `Ticket Number: ${prefix.split('')}, - ${suffix.split('')}, Please Proceed To Room, ${queue.room}`;
        const utterance = t(
          'ticketAnnouncement',
          'Ticket number: {{prefix}}, - {{suffix}}, please proceed to room {{room}}',
          {
            prefix: prefix.split(''),
            suffix: suffix.split(''),
            room: queue.room,
          },
        );
        message.rate = 1;
        message.pitch = 1;
        message.text = utterance;
        return new Promise<void>((resolve) => {
          message.onend = () => resolve();
          speaker.speak(message);
        });
      }
      return Promise.resolve();
    },
    [speaker],
  );

  useEffect(() => {
    const ticketsToCallOut = locationFilteredTickets.filter((item) => item.status.toLowerCase() === 'calling');
    if (ticketsToCallOut.length > 0 && !isSpeaking) {
      setIsSpeaking(true);
      const readTickets = async () => {
        for (const ticket of ticketsToCallOut) {
          await readTicket(ticket);
        }
        setIsSpeaking(false);
        if (typeof mutate === 'function') {
          mutate();
        }
        mutate?.();
      };

      readTickets();
    }

    return () => {};
  }, [locationFilteredTickets, isSpeaking]);

  if (isLoading) {
    return <DataTableSkeleton row={5} className={styles.queueScreen} role="progressbar" />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('queueScreenError', 'Queue screen error')} />;
  }
  return (
    <div>
      <PatientQueueHeader title={t('queueScreen', 'Queue screen')} showLocationDropdown />
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
