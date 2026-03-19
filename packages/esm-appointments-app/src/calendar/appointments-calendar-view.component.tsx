import React, { useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useAppointmentsCalendar } from '../hooks/useAppointmentsCalendar';
import AppointmentsHeader from '../header/appointments-header.component';
import CalendarHeader, { type CalendarViewMode } from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import WeeklyCalendarView from './weekly/weekly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import DayAppointmentsModal from './day-appointments-modal/day-appointments-modal.component';
import {
  CALENDAR_SYSTEMS,
  type CalendarSystem,
  type CalendarDate,
  isoToCalendarDate,
  calendarDateToISO,
} from './calendar-systems';

/**
 * AppointmentsCalendarView (upgraded)
 *
 * Orchestrates:
 *  - Monthly / Weekly / Daily view switching
 *  - Multi-calendar system support (Gregorian, Ethiopic, Islamic, Persian)
 *  - Modal-based day drill-down (no page navigation on day click)
 *  - Real API data via useAppointmentsCalendar (summary) and useAppointmentsByDate (detail)
 */
const AppointmentsCalendarView: React.FC = () => {
  const { t } = useTranslation();

  // ── Calendar system state ─────────────────────────────────────────────────
  const [calSysKey, setCalSysKey] = useState<string>('gregory');
  const calendarSystem: CalendarSystem = CALENDAR_SYSTEMS[calSysKey];

  // ── View mode state ────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');

  // ── Navigation date in the active calendar system ──────────────────────────
  // Initialise to today in the default (Gregorian) calendar system
  const [navDate, setNavDate] = useState<CalendarDate>(() => {
    const today = dayjs();
    return CALENDAR_SYSTEMS.gregory.fromGregorian(
      today.year(),
      today.month(), // 0-based
      today.date(),
    );
  });

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalIsoDate, setModalIsoDate] = useState<string | null>(null);

  // ── Derive the ISO date for the current navDate (used by API hooks) ────────
  const navIsoDate = useMemo(
    () => calendarDateToISO(calSysKey, navDate.year, navDate.month, navDate.day),
    [calSysKey, navDate],
  );

  // ── Fetch monthly summary (counts by service per day) ─────────────────────
  const period = viewMode === 'monthly' ? 'monthly' : viewMode === 'weekly' ? 'weekly' : 'daily';

  const { calendarEvents } = useAppointmentsCalendar(dayjs(navIsoDate).toISOString(), period);

  // ── Handle calendar system change: re-project navDate ─────────────────────
  const handleCalendarSystemChange = useCallback(
    (newKey: string) => {
      // Convert current navDate through Gregorian as the neutral format
      const g = calendarSystem.toGregorian(navDate.year, navDate.month, navDate.day);
      const converted = CALENDAR_SYSTEMS[newKey].fromGregorian(g.year, g.month, g.day);
      setNavDate(converted);
      setCalSysKey(newKey);
    },
    [calendarSystem, navDate],
  );

  // ── Navigation handlers ────────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    if (viewMode === 'monthly') {
      const isFirst = navDate.month === 0;
      const newMonth = isFirst ? calendarSystem.monthsInYear - 1 : navDate.month - 1;
      const newYear = isFirst ? navDate.year - 1 : navDate.year;
      const maxDay = calendarSystem.getDaysInMonth(newYear, newMonth);
      setNavDate({ year: newYear, month: newMonth, day: Math.min(navDate.day, maxDay) });
    } else {
      // weekly: go back 7 days; daily: go back 1 day
      const daysBack = viewMode === 'weekly' ? 7 : 1;
      const g = calendarSystem.toGregorian(navDate.year, navDate.month, navDate.day);
      const prev = dayjs(new Date(g.year, g.month, g.day)).subtract(daysBack, 'day');
      const converted = calendarSystem.fromGregorian(prev.year(), prev.month(), prev.date());
      setNavDate(converted);
    }
  }, [viewMode, navDate, calendarSystem]);

  const handleNext = useCallback(() => {
    if (viewMode === 'monthly') {
      const isLast = navDate.month === calendarSystem.monthsInYear - 1;
      const newMonth = isLast ? 0 : navDate.month + 1;
      const newYear = isLast ? navDate.year + 1 : navDate.year;
      const maxDay = calendarSystem.getDaysInMonth(newYear, newMonth);
      setNavDate({ year: newYear, month: newMonth, day: Math.min(navDate.day, maxDay) });
    } else {
      const daysForward = viewMode === 'weekly' ? 7 : 1;
      const g = calendarSystem.toGregorian(navDate.year, navDate.month, navDate.day);
      const next = dayjs(new Date(g.year, g.month, g.day)).add(daysForward, 'day');
      const converted = calendarSystem.fromGregorian(next.year(), next.month(), next.date());
      setNavDate(converted);
    }
  }, [viewMode, navDate, calendarSystem]);

  // ── Day selection (opens modal) ────────────────────────────────────────────
  const handleSelectDate = useCallback((isoDate: string) => {
    setModalIsoDate(isoDate);
  }, []);

  // ── Drill-down from modal to daily view ────────────────────────────────────
  const handleDrillDown = useCallback(
    (_mode: 'daily', isoDate: string) => {
      const converted = isoToCalendarDate(calSysKey, isoDate);
      setNavDate(converted);
      setViewMode('daily');
      setModalIsoDate(null);
    },
    [calSysKey],
  );

  // ── View mode change: keep the date but close any open modal ──────────────
  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
    setModalIsoDate(null);
  }, []);

  return (
    <div data-testid="appointments-calendar">
      <AppointmentsHeader title={t('calendar', 'Calendar')} />

      <CalendarHeader
        viewMode={viewMode}
        calendarSystem={calendarSystem}
        navDate={navDate}
        onViewModeChange={handleViewModeChange}
        onCalendarSystemChange={handleCalendarSystemChange}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* ── Calendar body ── */}
      {viewMode === 'monthly' && (
        <MonthlyCalendarView events={calendarEvents} navIsoDate={navIsoDate} onSelectDate={handleSelectDate} />
      )}

      {viewMode === 'weekly' && (
        <WeeklyCalendarView
          calendarSystem={calendarSystem}
          year={navDate.year}
          month={navDate.month}
          day={navDate.day}
          onSelectDate={handleSelectDate}
        />
      )}

      {viewMode === 'daily' && (
        <DailyCalendarView
          calendarSystem={calendarSystem}
          year={navDate.year}
          month={navDate.month}
          day={navDate.day}
        />
      )}

      {/* ── Day appointments modal ── */}
      {modalIsoDate && (
        <DayAppointmentsModal
          isoDate={modalIsoDate}
          calendarSystem={calendarSystem}
          onClose={() => setModalIsoDate(null)}
          onDrillDown={handleDrillDown}
        />
      )}
    </div>
  );
};

export default AppointmentsCalendarView;
