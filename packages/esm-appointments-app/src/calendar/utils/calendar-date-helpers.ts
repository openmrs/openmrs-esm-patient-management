import {
  CalendarDate,
  type DateValue,
  getDayOfWeek,
  getLocalTimeZone,
  parseDate,
  startOfWeek,
  today,
  toCalendar,
} from '@internationalized/date';

import { CALENDAR_SYSTEMS, type CalendarSystemConfig } from './calendar-systems';

export function parseISO(isoDate: string): CalendarDate {
  return parseDate(isoDate);
}
export function dateValueToISO(date: DateValue): string {
  return date.toString();
}
export function getTodayISO(): string {
  return today(getLocalTimeZone()).toString();
}

export function isoToCalendarDate(calKey: string, isoDate: string): CalendarDate {
  const config = getCalendarConfig(calKey);
  const gregDate = parseDate(isoDate);
  return toCalendar(gregDate, config.calendar) as CalendarDate;
}

export function calendarDateToISO(calKey: string, calDate: CalendarDate): string {
  const gregDate = toCalendar(calDate, CALENDAR_SYSTEMS.gregory.calendar) as CalendarDate;
  return gregDate.toString();
}

export interface WeekDay {
  readonly iso: string;
  readonly calDate: CalendarDate;
  readonly dow: number;
}
export function getWeekDays(calKey: string, isoDate: string): ReadonlyArray<WeekDay> {
  const config = getCalendarConfig(calKey);
  const gregPivot = parseDate(isoDate);
  const firstDayLocale = DOW_LOCALE_MAP[config.firstDayOfWeek];
  const weekStart = startOfWeek(gregPivot, 'en-US', firstDayLocale);

  return Array.from({ length: 7 }, (_, i) => {
    const gregDay = weekStart.add({ days: i });
    const calDay = toCalendar(gregDay, config.calendar) as CalendarDate;
    return {
      iso: gregDay.toString(),
      calDate: calDay,
      dow: getDayOfWeek(gregDay, 'en-US', 'sun'),
    } satisfies WeekDay;
  });
}

export function getOrderedDowLabels(calKey: string): ReadonlyArray<string> {
  const { daysOfWeek, firstDayOfWeek } = getCalendarConfig(calKey);
  return [...daysOfWeek.slice(firstDayOfWeek), ...daysOfWeek.slice(0, firstDayOfWeek)];
}

export interface MonthGridCell {
  readonly iso: string | null;
  readonly day: number | null;
  readonly isToday: boolean;
  readonly isPadding: boolean;
}
export function getMonthGridCells(calKey: string, year: number, month: number): ReadonlyArray<MonthGridCell> {
  const config = getCalendarConfig(calKey);
  const todayISO = getTodayISO();
  const firstOfMonth = new CalendarDate(config.calendar, year, month, 1);
  const firstOfMonthGreg = toCalendar(firstOfMonth, CALENDAR_SYSTEMS.gregory.calendar) as CalendarDate;
  const firstWeekday = getDayOfWeek(firstOfMonthGreg, 'en-US', 'sun');
  const leadingPadding = (firstWeekday - config.firstDayOfWeek + 7) % 7;
  const daysInMonth = config.calendar.getDaysInMonth(firstOfMonth);
  const TOTAL_CELLS = 42;
  const cells: MonthGridCell[] = [];

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const dayNum = i - leadingPadding + 1;

    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ iso: null, day: null, isToday: false, isPadding: true });
      continue;
    }

    const calDay = new CalendarDate(config.calendar, year, month, dayNum);
    const gregDay = toCalendar(calDay, CALENDAR_SYSTEMS.gregory.calendar) as CalendarDate;
    const iso = gregDay.toString();

    cells.push({ iso, day: dayNum, isToday: iso === todayISO, isPadding: false });
  }

  return cells;
}

function getCalendarConfig(calKey: string): CalendarSystemConfig {
  const config = CALENDAR_SYSTEMS[calKey];
  if (!config) {
    throw new Error(
      `[calendar-date-helpers] Unknown calendar system key: "${calKey}". ` +
        `Valid keys are: ${Object.keys(CALENDAR_SYSTEMS).join(', ')}.`,
    );
  }
  return config;
}

const DOW_LOCALE_MAP: Readonly<Record<number, 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};
