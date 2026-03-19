import React, { useMemo } from 'react';
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { type CalendarSystem, type WeekDay, getWeekDays, getTodayISO } from '../calendar-systems';
import {
  STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
  getServiceColor,
  CALENDAR_HOURS,
  formatHourLabel,
} from '../calendar-constants';
import styles from './weekly-calendar-view.scss';

interface WeeklyCalendarViewProps {
  /** The calendar system to use for display */
  calendarSystem: CalendarSystem;
  /** Navigation anchor: calendar-system year */
  year: number;
  /** Navigation anchor: calendar-system month (0-based) */
  month: number;
  /** Navigation anchor: calendar-system day */
  day: number;
  /**
   * Called when the user clicks an occupied time slot.
   * Receives the ISO date string (YYYY-MM-DD) so the parent can open the modal.
   */
  onSelectDate: (isoDate: string) => void;
}

/**
 * WeeklyCalendarView
 *
 * Renders a 7-column × N-row time grid for the week that contains the
 * given calendar date.  Appointment data is fetched live for each visible
 * day using the standard OpenMRS appointments endpoint.
 */
const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ calendarSystem, year, month, day, onSelectDate }) => {
  const todayISO = getTodayISO();

  const weekDays: WeekDay[] = useMemo(
    () => getWeekDays(calendarSystem.key, year, month, day),
    [calendarSystem, year, month, day],
  );

  return (
    <div className={styles.weeklyViewContainer}>
      <div className={styles.weeklyGrid}>
        {/* ── Column headers ── */}
        <div className={styles.cornerCell} />
        {weekDays.map((wd) => {
          const isToday = wd.iso === todayISO;
          const monthName = calendarSystem.months[wd.month] ?? `M${wd.month + 1}`;
          const dowLabel = calendarSystem.daysOfWeek[wd.dow] ?? String(wd.dow);
          return (
            <div key={wd.iso} className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ''}`}>
              <div className={styles.dayHeaderDowLabel}>{dowLabel}</div>
              <div className={`${styles.dayHeaderDayNum} ${isToday ? styles.dayHeaderDayNumToday : ''}`}>{wd.day}</div>
              <div className={styles.dayHeaderMonthLabel}>{monthName}</div>
            </div>
          );
        })}

        {/* ── Time-slot rows — one per weekday per hour ── */}
        {CALENDAR_HOURS.map((hr) => (
          <WeeklyHourRow key={hr} hour={hr} weekDays={weekDays} todayISO={todayISO} onSelectDate={onSelectDate} />
        ))}
      </div>
    </div>
  );
};

// ─── Per-hour row (splits fetching per day to avoid over-fetching) ────────────

interface WeeklyHourRowProps {
  hour: number;
  weekDays: WeekDay[];
  todayISO: string;
  onSelectDate: (isoDate: string) => void;
}

const WeeklyHourRow: React.FC<WeeklyHourRowProps> = ({ hour, weekDays, todayISO, onSelectDate }) => (
  <>
    <div className={styles.timeLabel}>{formatHourLabel(hour)}</div>
    {weekDays.map((wd) => (
      <WeeklySlotCell
        key={wd.iso}
        isoDate={wd.iso}
        hour={hour}
        isToday={wd.iso === todayISO}
        onSelectDate={onSelectDate}
      />
    ))}
  </>
);

// ─── Individual slot cell ─────────────────────────────────────────────────────

interface WeeklySlotCellProps {
  isoDate: string;
  hour: number;
  isToday: boolean;
  onSelectDate: (isoDate: string) => void;
}

/**
 * A single cell in the weekly grid.
 * Uses useAppointmentsByDate — SWR will deduplicate calls for the same isoDate
 * across all 12 hour-rows for that column.
 */
const WeeklySlotCell: React.FC<WeeklySlotCellProps> = ({ isoDate, hour, isToday, onSelectDate }) => {
  const { appointments } = useAppointmentsByDate(isoDate);

  const slotAppts = useMemo(
    () =>
      appointments.filter((a) => {
        const apptHour = new Date(a.startDateTime).getHours();
        return apptHour === hour;
      }),
    [appointments, hour],
  );

  const hasAppts = slotAppts.length > 0;

  const handleClick = () => {
    if (hasAppts) onSelectDate(isoDate);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        ${styles.slotCell}
        ${isToday ? styles.slotCellToday : ''}
        ${hasAppts ? styles.slotCellHasAppts : ''}
      `}>
      {slotAppts.map((appt) => (
        <AppointmentChip key={appt.uuid} appointment={appt} />
      ))}
    </div>
  );
};

// ─── Appointment chip ─────────────────────────────────────────────────────────

interface AppointmentChipProps {
  appointment: Appointment;
}

const AppointmentChip: React.FC<AppointmentChipProps> = ({ appointment }) => {
  const statusStyle = STATUS_STYLES[appointment.status] ?? DEFAULT_STATUS_STYLE;
  const serviceColor = getServiceColor(appointment.service?.name ?? '');

  return (
    <div
      className={styles.apptChip}
      style={{
        background: serviceColor + '18',
        borderLeftColor: serviceColor,
      }}>
      <span className={styles.apptChipName}>{appointment.patient?.name ?? '—'}</span>
      <span className={styles.apptChipStatus} style={{ color: statusStyle.text }}>
        {appointment.status}
      </span>
    </div>
  );
};

export default WeeklyCalendarView;
