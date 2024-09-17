import React, { useState, useEffect } from 'react';
import { DataTableSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useActiveTickets } from './useActiveTickets';
import PatientQueueHeader from '../patient-queue-header/patient-queue-header.component';
import styles from './queue-screen.scss';
import { useSelectedQueueLocationUuid } from '../helpers/helpers';

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

  function readTicket(queue, speaker) {
    if ('speechSynthesis' in window) {
      const message = new SpeechSynthesisUtterance();
      const utterance =
        'Ticket Number: ' +
        queue.ticketNumber.split('-')[0].split('') +
        ', - ' +
        queue.ticketNumber.split('-')[1].split('') +
        ', Please Proceed To Room, ' +
        queue.room;
      message.rate = 1;
      message.pitch = 1;
      message.text = utterance;
      return new Promise((resolve) => {
        message.onend = resolve;
        speaker.speak(message);
      });
    } else {
      return Promise.resolve();
    }
  }

  useEffect(() => {
    const readableTickets = locationFilteredTickets.filter((item) => item.status == 'calling');
    if (readableTickets.length > 0 && !isSpeaking) {
      setIsSpeaking(true);
      const readTickets = async () => {
        for (const ticket of readableTickets) {
          await readTicket(ticket, speaker);
        }
        setIsSpeaking(false);
        if (typeof mutate === 'function') {
          mutate();
        }
      };

      readTickets();
    }

    return () => {};
  }, [locationFilteredTickets, isSpeaking]);

  if (isLoading) {
    return <DataTableSkeleton row={5} className={styles.queueScreen} role="progressbar" />;
  }

  if (error) {
    return <div>Error</div>;
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
