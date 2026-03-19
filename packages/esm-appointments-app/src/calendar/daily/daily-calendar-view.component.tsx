import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { type CalendarSystem, calendarDateToISO } from '../calendar-systems';
import {
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
  getServiceColor,
  CALENDAR_HOURS,
  formatHourLabel,
} from '../calendar-constants';
import styles from './daily-calendar-view.scss';

interface DailyCalendarViewProps {
  /** The calendar system to use for display */
  calendarSystem: CalendarSystem;
  /** Calendar-system year */
  year: number;
  /** Calendar-system month (0-based) */
  month: number;
  /** Calendar-system day */
  day: number;
}

/**
 * DailyCalendarView
 *
 * Shows a full-day schedule for a single date.
 * Fetches real appointment data from the OpenMRS REST API.
 * Appointments are grouped into hour-slots and displayed as colour-coded cards.
 */
const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ calendarSystem, year, month, day }) => {
  const { t } = useTranslation();

  const isoDate = useMemo(
    () => calendarDateToISO(calendarSystem.key, year, month, day),
    [calendarSystem, year, month, day],
  );

  const { appointments, isLoading } = useAppointmentsByDate(isoDate);

  const monthName = calendarSystem.months[month] ?? `Month ${month + 1}`;
  const dayTitle = `${monthName} ${day}, ${year}`;
  const apptCount = appointments.length;

  if (isLoading) {
    return (
      <div className={styles.dailyViewContainer}>
        <div className={styles.loadingWrapper}>
          <InlineLoading description={t('loadingAppointments', 'Loading appointments…')} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dailyViewContainer}>
      {/* ── Day heading ── */}
      <div className={styles.dayHeading}>
        <h2 className={styles.dayTitle}>{dayTitle}</h2>
        <p className={styles.daySubtitle}>
          {apptCount === 0
            ? t('noAppointments', 'No appointments scheduled')
            : t('appointmentCount', '{{count}} appointment(s)', { count: apptCount })}
        </p>
      </div>

      {apptCount === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyStateIcon}>📅</span>
          <span>{t('noAppointmentsForDay', 'No appointments for this day')}</span>
        </div>
      ) : (
        <div>
          {CALENDAR_HOURS.map((hr) => {
            const slotAppts = appointments.filter((a) => {
              const h = new Date(a.startDateTime).getHours();
              return h === hr;
            });
            return <DailyHourRow key={hr} hour={hr} appointments={slotAppts} />;
          })}
        </div>
      )}
    </div>
  );
};

// ─── Hour row ──────────────────────────────────────────────────────────────────

interface DailyHourRowProps {
  hour: number;
  appointments: Array<Appointment>;
}

const DailyHourRow: React.FC<DailyHourRowProps> = ({ hour, appointments }) => (
  <div className={styles.hourRow}>
    <div className={styles.hourLabel}>{formatHourLabel(hour)}</div>
    <div className={styles.hourSlot}>
      {appointments.map((appt) => (
        <DailyAppointmentCard key={appt.uuid} appointment={appt} />
      ))}
    </div>
  </div>
);

// ─── Appointment card ──────────────────────────────────────────────────────────

interface DailyAppointmentCardProps {
  appointment: Appointment;
}

const DailyAppointmentCard: React.FC<DailyAppointmentCardProps> = ({ appointment }) => {
  const statusStyle = STATUS_STYLES[appointment.status] ?? DEFAULT_STATUS_STYLE;
  const serviceColor = getServiceColor(appointment.service?.name ?? '');

  // Format start time as HH:MM from the ISO datetime string
  const startTime = useMemo(() => {
    const d = new Date(appointment.startDateTime);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }, [appointment.startDateTime]);

  return (
    <div
      className={styles.apptCard}
      style={{
        background: serviceColor + '12',
        borderLeftColor: serviceColor,
      }}>
      <span className={styles.apptTime}>{startTime}</span>

      <div className={styles.apptDetails}>
        <div className={styles.apptPatientName}>{appointment.patient?.name ?? '—'}</div>
        <div className={styles.apptService} style={{ color: serviceColor }}>
          {appointment.service?.name ?? '—'}
        </div>
      </div>

      <span className={styles.apptStatusBadge} style={{ background: statusStyle.bg, color: statusStyle.text }}>
        {appointment.status}
      </span>
    </div>
  );
};

export default DailyCalendarView;
