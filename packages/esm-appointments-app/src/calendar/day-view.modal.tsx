import { InlineLoading, ModalBody, ModalHeader, Tag } from '@carbon/react';
import { formatDate, formatTime, parseDate } from '@openmrs/esm-framework';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointmentList } from '../hooks/useAppointmentList';
import { type Appointment } from '../types';
import styles from './day-view.modal.scss';

interface DayViewModalProps {
  dateTime: Dayjs;
  closeModal: () => void;
}

function groupByService(appointments: Array<Appointment>) {
  const map: Record<string, Array<Appointment>> = {};
  appointments.forEach((appt) => {
    const name = appt.service?.name ?? 'Unknown';
    if (!map[name]) map[name] = [];
    map[name].push(appt);
  });
  return map;
}

function statusTagType(status: string): 'green' | 'blue' | 'red' | 'warm-gray' | 'teal' | 'gray' {
  switch (status) {
    case 'CheckedIn':
      return 'green';
    case 'Scheduled':
      return 'blue';
    case 'Cancelled':
      return 'red';
    case 'Missed':
      return 'warm-gray';
    case 'Completed':
      return 'teal';
    default:
      return 'gray';
  }
}

const DayViewModal: React.FC<DayViewModalProps> = ({ dateTime, closeModal }) => {
  const { t } = useTranslation();

  const formattedDate = dayjs(dateTime).startOf('day').toISOString();
  const displayDate = formatDate(parseDate(dayjs(dateTime).startOf('day').toISOString()), {
    mode: 'standard',
    time: false,
  });

  const { appointmentList, isLoading } = useAppointmentList(formattedDate);

  const allAppointments = useMemo(
    () => [...appointmentList].sort((a, b) => dayjs(a.startDateTime).diff(dayjs(b.startDateTime))),
    [appointmentList],
  );

  const grouped = useMemo(() => groupByService(allAppointments), [allAppointments]);
  const serviceNames = Object.keys(grouped);

  const [openServices, setOpenServices] = useState<Record<string, boolean>>({});

  const isOpen = (name: string, index: number) => {
    if (name in openServices) return openServices[name];
    return index === 0;
  };

  const toggleService = (name: string, index: number) => {
    setOpenServices((prev) => ({ ...prev, [name]: !isOpen(name, index) }));
  };

  return (
    <>
      <ModalHeader closeModal={closeModal}>
        <div className={styles.modalHeaderContent}>
          <span className={styles.modalTitle}>{displayDate}</span>
          {!isLoading && (
            <span className={styles.modalSubtitle}>
              {t('totalAppointments', '{{count}} appointments', { count: allAppointments.length })}
            </span>
          )}
        </div>
      </ModalHeader>

      <ModalBody className={styles.modalBody}>
        {isLoading ? (
          <InlineLoading description={`${t('loading', 'Loading')}...`} className={styles.loader} />
        ) : allAppointments.length === 0 ? (
          <p className={styles.emptyText}>{t('noAppointmentsForDay', 'No appointments scheduled for this day.')}</p>
        ) : (
          <div className={styles.accordionList}>
            {serviceNames.map((serviceName, index) => {
              const appointments = grouped[serviceName];
              const open = isOpen(serviceName, index);
              return (
                <div key={serviceName} className={styles.accordionItem}>
                  <button
                    type="button"
                    className={styles.accordionHeader}
                    onClick={() => toggleService(serviceName, index)}
                    aria-expanded={open}>
                    <div className={styles.accordionHeaderLeft}>
                      <span className={styles.accordionChevron}>{open ? '▾' : '▸'}</span>
                      <span className={styles.serviceName}>{serviceName}</span>
                    </div>
                    <Tag type="gray" size="sm">
                      {appointments.length === 1
                        ? t('oneAppointment', '1 appointment')
                        : t('countAppointments', '{{count}} appointments', { count: appointments.length })}
                    </Tag>
                  </button>

                  {open && (
                    <div className={styles.accordionBody}>
                      {appointments.map((appt) => {
                        const startTime = formatTime(parseDate(appt.startDateTime));
                        const endTime = appt.endDateTime ? formatTime(parseDate(appt.endDateTime)) : null;

                        return (
                          <div key={appt.uuid} className={styles.appointmentRow}>
                            <div className={styles.timeColumn}>
                              <span className={styles.startTime}>{startTime}</span>
                              {endTime && <span className={styles.endTime}>{endTime}</span>}
                            </div>
                            <div className={styles.detailsColumn}>
                              <span className={styles.patientName}>{appt.patient?.name}</span>
                              {appt.providers?.length > 0 && (
                                <span className={styles.providerName}>{appt.providers[0]?.display}</span>
                              )}
                            </div>
                            <Tag type={statusTagType(appt.status)} size="sm">
                              {t(appt.status, appt.status)}
                            </Tag>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ModalBody>
    </>
  );
};

export default DayViewModal;
