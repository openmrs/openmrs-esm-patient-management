import React, { useMemo } from 'react';
import { Tag, InlineLoading } from '@carbon/react';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatAMPM } from '../../helpers/functions';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { STATUS_TAG_TYPES, DEFAULT_STATUS_TAG_TYPE, CALENDAR_HOURS, formatHourLabel } from '../utils/calendar-colors';
import styles from './daily-calendar-view.scss';

interface DailyCalendarViewProps {
  calendarSelectedDate: Dayjs;
  serviceColorMap?: Map<string, string>;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calendarSelectedDate, serviceColorMap }) => {
  const { t } = useTranslation();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const hourSlots = useMemo(
    () =>
      CALENDAR_HOURS.map((hr) => ({
        hr,
        appts: appointments.filter((a) => {
          if (a.startDateTime == null) return false;
          return new Date(a.startDateTime).getHours() === hr;
        }),
      })).filter((s) => s.appts.length > 0),
    [appointments],
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {appointments.length === 0 && (
        <div className={styles.heading}>
          <p className={styles.subtitle}>{t('noAppointments', 'No appointments scheduled')}</p>
        </div>
      )}
      {hourSlots.map(({ hr, appts }) => (
        <div key={hr} className={styles.hourRow}>
          <div className={styles.hourLabel}>{formatHourLabel(hr)}</div>
          <div className={styles.hourSlot}>
            {appts.map((a) => (
              <DailyCard key={a.uuid} appointment={a} serviceColorMap={serviceColorMap} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const DailyCard: React.FC<{ appointment: Appointment; serviceColorMap?: Map<string, string> }> = ({
  appointment,
  serviceColorMap,
}) => {
  const color = serviceColorMap?.get(appointment.service?.uuid ?? '');
  const tagType = STATUS_TAG_TYPES[appointment.status] ?? DEFAULT_STATUS_TAG_TYPE;
  const time = useMemo(() => {
    if (appointment.startDateTime == null) return '—';
    return formatAMPM(new Date(appointment.startDateTime));
  }, [appointment.startDateTime]);

  return (
    <div className={styles.card} style={{ borderLeftColor: color }}>
      <span className={styles.cardTime}>{time}</span>
      <div className={styles.cardDetails}>
        <div className={styles.cardName}>{appointment.patient?.name ?? '—'}</div>
        <div className={styles.cardService} style={{ color }}>
          {appointment.service.name}
        </div>
      </div>
      <Tag type={tagType} size="sm">
        {appointment.status}
      </Tag>
    </div>
  );
};

export default DailyCalendarView;
