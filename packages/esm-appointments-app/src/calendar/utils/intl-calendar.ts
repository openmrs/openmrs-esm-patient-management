import {
  CalendarDate,
  GregorianCalendar,
  toCalendar,
  startOfMonth,
  endOfMonth,
  getDayOfWeek,
  type Calendar,
} from '@internationalized/date';
import { type Dayjs } from 'dayjs';

export function parseGregorianDate(isoDate: string): CalendarDate {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new CalendarDate(year, month, day);
}

/**
 * Convert a Dayjs (Gregorian) to a CalendarDate in the target calendar system.
 */
export function toLocalCalendarDate(dateTime: Dayjs, calendar: Calendar): CalendarDate {
  const gregDate = parseGregorianDate(dateTime.format('YYYY-MM-DD'));
  return toCalendar(gregDate, calendar);
}

/**
 * Convert a CalendarDate (any calendar) back to a Gregorian ISO date string YYYY-MM-DD.
 */
export function toISODate(date: CalendarDate): string {
  const greg = toCalendar(date, new GregorianCalendar());
  const y = greg.year.toString().padStart(4, '0');
  const m = greg.month.toString().padStart(2, '0');
  const d = greg.day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildMonthGrid(currentDate: Dayjs, calendar: Calendar): string[] {
  const localDate = toLocalCalendarDate(currentDate, calendar);
  const monthStart = startOfMonth(localDate);
  const monthEnd = endOfMonth(localDate);

  const startDow = getDayOfWeek(monthStart, 'en', 'sun');

  const grid: string[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    grid.push(toISODate(monthStart.subtract({ days: i + 1 })));
  }

  let cur: CalendarDate = monthStart;
  while (cur.compare(monthEnd) <= 0) {
    grid.push(toISODate(cur));
    cur = cur.add({ days: 1 });
  }

  let trailing = 1;
  while (grid.length % 7 !== 0) {
    grid.push(toISODate(monthEnd.add({ days: trailing })));
    trailing++;
  }

  return grid;
}

export function isSameLocalMonth(isoA: string, isoB: string, calendar: Calendar): boolean {
  const a = toCalendar(parseGregorianDate(isoA), calendar);
  const b = toCalendar(parseGregorianDate(isoB), calendar);
  return a.year === b.year && a.month === b.month && a.calendar.identifier === b.calendar.identifier;
}

function toLocalDateNoon(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatLocalDayNumber(isoDate: string, locale: string, calendarId: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', calendar: calendarId } as Intl.DateTimeFormatOptions).format(
    toLocalDateNoon(isoDate),
  );
}

export function formatLocalPopoverDate(isoDate: string, locale: string, calendarId: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    calendar: calendarId,
  } as Intl.DateTimeFormatOptions).format(toLocalDateNoon(isoDate));
}

export function formatLocalHourLabel(hour: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric' } as Intl.DateTimeFormatOptions).format(
    new Date(1970, 0, 1, hour, 0, 0),
  );
}

export function formatLocalTime(hours: number, minutes: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' } as Intl.DateTimeFormatOptions).format(
    new Date(1970, 0, 1, hours, minutes, 0),
  );
}

export function addLocalMonth(currentDate: Dayjs, direction: 1 | -1, calendar: Calendar): string {
  const localDate = toLocalCalendarDate(currentDate, calendar);
  const moved = direction === 1 ? localDate.add({ months: 1 }) : localDate.subtract({ months: 1 });
  return toISODate(moved);
}
