import React, { useMemo } from 'react';
import { Tag, InlineLoading } from '@carbon/react';
import { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatAMPM } from '../../helpers/functions';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import {
  getServiceColor,
  STATUS_TAG_TYPES,
  DEFAULT_STATUS_TAG_TYPE,
  CALENDAR_HOURS,
  formatHourLabel,
} from '../utils/calendar-colors';
import styles from './daily-calendar-view.scss';

const LOCALE_MAP: Record<string, string> = {
  gregory: 'en-US',
  ethiopic: 'am-ET',
  islamic: 'ar-SA',
  persian: 'fa-IR',
};

interface DailyCalendarViewProps {
  calKey: string;
  calendarSelectedDate: Dayjs;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calKey, calendarSelectedDate }) => {
  const { t } = useTranslation();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const locale = LOCALE_MAP[calKey] ?? 'en-US';
  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const displayDate = useMemo(() => {
    const d = calendarSelectedDate.toDate();
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: calKey,
    }).format(d);
  }, [calendarSelectedDate, locale, calKey]);

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
      <div className={styles.heading}>
        <h2 className={styles.title}>{displayDate}</h2>
        <p className={styles.subtitle}>
          {appointments.length === 0
            ? t('noAppointments', 'No appointments scheduled')
            : t('appointmentCount', '{{count}} appointment(s)', { count: appointments.length })}
        </p>
      </div>
      {hourSlots.map(({ hr, appts }) => (
        <div key={hr} className={styles.hourRow}>
          <div className={styles.hourLabel}>{formatHourLabel(hr)}</div>
          <div className={styles.hourSlot}>
            {appts.map((a) => (
              <DailyCard key={a.uuid} appointment={a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const DailyCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const color = getServiceColor(appointment.service.name);
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
