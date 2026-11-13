import dayjs, { type Dayjs } from 'dayjs';
import {
  CalendarDate,
  type CalendarIdentifier,
  createCalendar,
  endOfMonth,
  GregorianCalendar,
  isSameMonth,
  startOfMonth,
  toCalendar,
} from '@internationalized/date';
import { getDefaultCalendar, getLocale } from '@openmrs/esm-framework';

const gregorianCalendar = new GregorianCalendar();

/**
 * The user's locale and the calendar it uses. The calendar comes from the framework, where the app shell
 * registers the implementation's `preferredCalendar` setting at startup (for example, Amharic to Ethiopic).
 */
export function getCalendarFormat(): { locale: string; calendar: string } {
  const locale = getLocale() || 'en';
  const calendar = getDefaultCalendar(locale) ?? 'gregory';
  return { locale, calendar };
}

/**
 * Formats a date in the given calendar. Like the framework's `formatDate`, it leaves out the era of the Ethiopic
 * calendar, which browsers otherwise show (e.g. "Hedar 2019 ERA1").
 */
export function formatInCalendar(
  date: Date,
  options: Intl.DateTimeFormatOptions,
  locale: string,
  calendar: string,
): string {
  const parts = new Intl.DateTimeFormat(locale, { ...options, calendar }).formatToParts(date);
  const isEthiopicEra = (index: number) =>
    parts[index].type === 'era' || (parts[index].type === 'literal' && parts[index + 1]?.type === 'era');

  return parts
    .filter((_, index) => calendar !== 'ethiopic' || !isEthiopicEra(index))
    .map((part) => part.value)
    .join('');
}

// Appointments, and the calendar's state, keep Gregorian dates. These helpers work out months in the calendar
// that the user's locale uses (e.g. the 13-month Ethiopic calendar), and hand back Gregorian dates.

function toLocaleCalendarDate(date: Dayjs, calendar: string): CalendarDate {
  return toCalendar(
    new CalendarDate(date.year(), date.month() + 1, date.date()),
    createCalendar(calendar as CalendarIdentifier),
  );
}

function toGregorianDayjs(date: CalendarDate): Dayjs {
  const { year, month, day } = toCalendar(date, gregorianCalendar);
  return dayjs(new Date(year, month - 1, day));
}

/** The first and last days of the month, in the given calendar, that contains `date`. */
export function getCalendarMonthRange(date: Dayjs, calendar: string): { start: Dayjs; end: Dayjs } {
  const localeDate = toLocaleCalendarDate(date, calendar);
  return {
    start: toGregorianDayjs(startOfMonth(localeDate)),
    end: toGregorianDayjs(endOfMonth(localeDate)),
  };
}

/** Moves `date` by a number of months in the given calendar, keeping the day of the month where it exists. */
export function addCalendarMonths(date: Dayjs, months: number, calendar: string): Dayjs {
  return toGregorianDayjs(toLocaleCalendarDate(date, calendar).add({ months }));
}

export function isSameCalendarMonth(date: Dayjs, otherDate: Dayjs, calendar: string): boolean {
  return isSameMonth(toLocaleCalendarDate(date, calendar), toLocaleCalendarDate(otherDate, calendar));
}

/** The day of the month of `date` in the given calendar. */
export function getCalendarDayOfMonth(date: Dayjs, calendar: string): number {
  return toLocaleCalendarDate(date, calendar).day;
}

/**
 * The days to show in a month grid, in the given calendar, for the month that contains `date`. Rows start on a
 * Sunday and are filled with the days of the previous and next months. When the month and the days before it
 * fill 30 cells or fewer, a further week is added. This keeps the layout the Gregorian calendar had before.
 */
export function getMonthGridDays(date: Dayjs, calendar: string): Array<Dayjs> {
  const { start, end } = getCalendarMonthRange(date, calendar);
  const leadingDays = start.day();
  const daysInMonth = end.diff(start, 'day') + 1;
  const trailingDays = 6 - end.day() + (leadingDays + daysInMonth <= 30 ? 7 : 0);
  const gridLength = leadingDays + daysInMonth + trailingDays;
  const firstDay = start.subtract(leadingDays, 'day');

  return Array.from({ length: gridLength }, (_, index) => firstDay.add(index, 'day'));
}
