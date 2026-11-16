import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { monthDays } from '../helpers';
import {
  addCalendarMonths,
  formatInCalendar,
  getCalendarDayOfMonth,
  getCalendarMonthRange,
  getMonthGridDays,
  isSameCalendarMonth,
} from './calendar-utils';

const isoDates = (days: Array<dayjs.Dayjs>) => days.map((day) => day.format('YYYY-MM-DD'));

describe('calendar-utils', () => {
  describe('with the Gregorian calendar', () => {
    it('lays out every month exactly as before', () => {
      for (let month = dayjs('2000-01-15'); month.isBefore('2040-01-01'); month = month.add(1, 'month')) {
        expect(isoDates(getMonthGridDays(month, 'gregory'))).toEqual(isoDates(monthDays(month)));
      }
    });

    it('moves by calendar months and finds the month range', () => {
      expect(addCalendarMonths(dayjs('2026-01-31'), 1, 'gregory').format('YYYY-MM-DD')).toBe('2026-02-28');
      expect(addCalendarMonths(dayjs('2026-11-13'), -1, 'gregory').format('YYYY-MM-DD')).toBe('2026-10-13');

      const { start, end } = getCalendarMonthRange(dayjs('2026-02-10'), 'gregory');
      expect([start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]).toEqual(['2026-02-01', '2026-02-28']);
    });
  });

  describe('with the Ethiopic calendar', () => {
    // 13 November 2026 is Hedar 4, 2019 in the Ethiopic calendar. Hedar 2019 runs from 10 November to 9 December.

    it('finds the Ethiopic month and the day within it', () => {
      const { start, end } = getCalendarMonthRange(dayjs('2026-11-13'), 'ethiopic');

      expect([start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]).toEqual(['2026-11-10', '2026-12-09']);
      expect(getCalendarDayOfMonth(dayjs('2026-11-13'), 'ethiopic')).toBe(4);
      expect(isSameCalendarMonth(dayjs('2026-11-13'), dayjs('2026-12-09'), 'ethiopic')).toBe(true);
      expect(isSameCalendarMonth(dayjs('2026-11-13'), dayjs('2026-11-09'), 'ethiopic')).toBe(false);
    });

    it('lays out a month grid that starts and ends with whole weeks', () => {
      const days = getMonthGridDays(dayjs('2026-11-13'), 'ethiopic');

      expect(days).toHaveLength(35);
      expect(days[0].format('YYYY-MM-DD')).toBe('2026-11-08');
      expect(days[0].day()).toBe(0);
      expect(days.at(-1).format('YYYY-MM-DD')).toBe('2026-12-12');
    });

    it('handles Pagume, the short thirteenth month, and the move into the next year', () => {
      // Pagume 2018 has 5 days, from 6 to 10 September 2026; Meskerem 1, 2019 is 11 September 2026.
      const pagume = dayjs('2026-09-08');
      const { start, end } = getCalendarMonthRange(pagume, 'ethiopic');
      const days = getMonthGridDays(pagume, 'ethiopic');

      expect([start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]).toEqual(['2026-09-06', '2026-09-10']);
      expect(days.filter((day) => isSameCalendarMonth(day, pagume, 'ethiopic'))).toHaveLength(5);
      expect(days.length % 7).toBe(0);
      // Pagume 3 + 1 month = Meskerem 3, 2019
      expect(addCalendarMonths(pagume, 1, 'ethiopic').format('YYYY-MM-DD')).toBe('2026-09-13');
      // Meskerem 1, 2019 - 1 month = Pagume 1, 2018
      expect(addCalendarMonths(dayjs('2026-09-11'), -1, 'ethiopic').format('YYYY-MM-DD')).toBe('2026-09-06');
      // Nehase 30, 2018 + 1 month = Pagume 5, the last day of the shorter month
      expect(addCalendarMonths(dayjs('2026-09-05'), 1, 'ethiopic').format('YYYY-MM-DD')).toBe('2026-09-10');
    });

    it('formats dates without the Ethiopic era', () => {
      const date = new Date(2026, 10, 13);

      expect(formatInCalendar(date, { year: 'numeric', month: 'long' }, 'en', 'ethiopic')).toBe('Hedar 2019');
      expect(formatInCalendar(date, { year: 'numeric', month: 'long', day: 'numeric' }, 'en', 'ethiopic')).toBe(
        'Hedar 4, 2019',
      );
      expect(formatInCalendar(date, { year: 'numeric', month: 'long' }, 'en', 'gregory')).toBe('November 2026');
    });

    it('puts Ethiopian New Year on the first of Meskerem in every year', () => {
      // Versions of @internationalized/date before 3.12.4 placed New Year in the outgoing year's Pagume
      // in three years out of four (adobe/react-spectrum#10390)
      for (const newYear of ['2023-09-12', '2024-09-11', '2025-09-11', '2026-09-11', '2027-09-12']) {
        expect(getCalendarDayOfMonth(dayjs(newYear), 'ethiopic')).toBe(1);
        expect(getCalendarMonthRange(dayjs(newYear), 'ethiopic').start.format('YYYY-MM-DD')).toBe(newYear);
      }
    });
  });

  it('finds months in the Islamic and Hebrew calendars', () => {
    // 13 November 2026 is 3 Jumada II 1448 and 3 Kislev 5787
    expect(getCalendarDayOfMonth(dayjs('2026-11-13'), 'islamic-umalqura')).toBe(3);
    expect(getCalendarMonthRange(dayjs('2026-11-13'), 'islamic-umalqura').start.format('YYYY-MM-DD')).toBe(
      '2026-11-11',
    );
    expect(getCalendarDayOfMonth(dayjs('2026-11-13'), 'hebrew')).toBe(3);
    expect(getCalendarMonthRange(dayjs('2026-11-13'), 'hebrew').start.format('YYYY-MM-DD')).toBe('2026-11-11');
  });
});
