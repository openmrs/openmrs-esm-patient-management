/**
 * calendar-systems.test.ts
 *
 * Pure-logic unit tests for the JDN-based calendar conversion utilities.
 * No React, no mocks — these run entirely in Node.
 */

import {
  gregorianToJdn,
  jdnToGregorian,
  islamicToJdn,
  jdnToIslamic,
  ethiopicToJdn,
  jdnToEthiopic,
  persianToJdn,
  jdnToPersian,
  CALENDAR_SYSTEMS,
  calendarDateToISO,
  isoToCalendarDate,
  getMonthGridCells,
  getWeekDays,
  getTodayISO,
} from './calendar-systems';

// ── JDN round-trip helpers ─────────────────────────────────────────────────────

describe('Gregorian ↔ JDN', () => {
  const cases: Array<[number, number, number, string]> = [
    [2000, 0, 1, 'Y2K'],
    [1970, 0, 1, 'Unix epoch'],
    [2026, 2, 10, 'A recent date'],
    [1582, 9, 15, 'Gregorian calendar adoption'],
    [2100, 11, 31, 'Far future'],
  ];

  test.each(cases)('round-trips %i-%i-%i (%s)', (year, month, day) => {
    const jdn = gregorianToJdn(year, month, day);
    const back = jdnToGregorian(jdn);
    expect(back).toEqual({ year, month, day });
  });
});

describe('Islamic ↔ JDN', () => {
  const cases: Array<[number, number, number, string]> = [
    [1400, 0, 1, 'Start of 1400 AH'],
    [1446, 8, 1, 'Ramadan 1446'],
    [1, 0, 1, 'First day of Islamic calendar'],
  ];

  test.each(cases)('round-trips %i-%i-%i (%s)', (year, month, day) => {
    const jdn = islamicToJdn(year, month, day);
    const back = jdnToIslamic(jdn);
    expect(back).toEqual({ year, month, day });
  });
});

describe('Ethiopic ↔ JDN', () => {
  const cases: Array<[number, number, number, string]> = [
    [2016, 0, 1, 'Meskerem 1, 2016'],
    [2018, 6, 1, 'Megabit 1, 2018'],
    [2000, 12, 1, 'Pagume 1, 2000 (13th month)'],
  ];

  test.each(cases)('round-trips %i-%i-%i (%s)', (year, month, day) => {
    const jdn = ethiopicToJdn(year, month, day);
    const back = jdnToEthiopic(jdn);
    expect(back).toEqual({ year, month, day });
  });
});

describe('Persian ↔ JDN', () => {
  const cases: Array<[number, number, number, string]> = [
    [1400, 0, 1, 'Farvardin 1, 1400'],
    [1404, 11, 29, 'Esfand 29, 1404'],
    [1, 0, 1, 'First day of Persian calendar'],
  ];

  test.each(cases)('round-trips %i-%i-%i (%s)', (year, month, day) => {
    const jdn = persianToJdn(year, month, day);
    const back = jdnToPersian(jdn);
    expect(back).toEqual({ year, month, day });
  });
});

// ── Cross-calendar known-date checks ──────────────────────────────────────────

describe('Cross-calendar known conversions', () => {
  it('converts 2026-03-10 (Gregorian) to correct Ethiopic date', () => {
    // 2026-03-10 Gregorian = Megabit 1, 2018 Ethiopic
    const result = CALENDAR_SYSTEMS.ethiopic.fromGregorian(2026, 2, 10);
    expect(result.month).toBe(6); // Megabit is month index 6
    expect(result.day).toBe(1);
    expect(result.year).toBe(2018);
  });

  it('converts 2026-03-10 (Gregorian) to Islamic and back without drift', () => {
    const islamic = CALENDAR_SYSTEMS.islamic.fromGregorian(2026, 2, 10);
    const back = CALENDAR_SYSTEMS.islamic.toGregorian(islamic.year, islamic.month, islamic.day);
    expect(back.year).toBe(2026);
    expect(back.month).toBe(2);
    expect(back.day).toBe(10);
  });

  it('converts 2026-03-10 (Gregorian) to Persian and back without drift', () => {
    const persian = CALENDAR_SYSTEMS.persian.fromGregorian(2026, 2, 10);
    const back = CALENDAR_SYSTEMS.persian.toGregorian(persian.year, persian.month, persian.day);
    expect(back.year).toBe(2026);
    expect(back.month).toBe(2);
    expect(back.day).toBe(10);
  });
});

// ── calendarDateToISO ──────────────────────────────────────────────────────────

describe('calendarDateToISO', () => {
  it('returns the same ISO string for Gregorian dates', () => {
    expect(calendarDateToISO('gregory', 2026, 2, 10)).toBe('2026-03-10');
  });

  it('correctly converts an Ethiopic date to ISO', () => {
    // Megabit 1, 2018 Ethiopic = 2026-03-10 Gregorian
    expect(calendarDateToISO('ethiopic', 2018, 6, 1)).toBe('2026-03-10');
  });

  it('pads month and day with leading zeros', () => {
    const iso = calendarDateToISO('gregory', 2026, 0, 5); // Jan 5
    expect(iso).toBe('2026-01-05');
  });
});

// ── isoToCalendarDate ──────────────────────────────────────────────────────────

describe('isoToCalendarDate', () => {
  it('round-trips a Gregorian date', () => {
    const cal = isoToCalendarDate('gregory', '2026-03-10');
    expect(cal).toEqual({ year: 2026, month: 2, day: 10 });
  });

  it('converts ISO to Ethiopic correctly', () => {
    const cal = isoToCalendarDate('ethiopic', '2026-03-10');
    expect(cal.year).toBe(2018);
    expect(cal.month).toBe(6); // Megabit
    expect(cal.day).toBe(1);
  });
});

// ── getMonthGridCells ──────────────────────────────────────────────────────────

describe('getMonthGridCells', () => {
  it('returns a length that is a multiple of 7', () => {
    const cells = getMonthGridCells('gregory', 2026, 2); // March 2026
    expect(cells.length % 7).toBe(0);
  });

  it('contains exactly 31 in-month cells for March', () => {
    const cells = getMonthGridCells('gregory', 2026, 2);
    const inMonth = cells.filter((c) => c.inMonth);
    expect(inMonth.length).toBe(31);
  });

  it('contains days 1 through 31 for March', () => {
    const cells = getMonthGridCells('gregory', 2026, 2);
    const days = cells.filter((c) => c.inMonth).map((c) => c.day);
    expect(days).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  it('returns 30 in-month cells for an Ethiopic standard month', () => {
    const cells = getMonthGridCells('ethiopic', 2018, 0); // Meskerem
    const inMonth = cells.filter((c) => c.inMonth);
    expect(inMonth.length).toBe(30);
  });

  it('fills prefix cells with day: null', () => {
    const cells = getMonthGridCells('gregory', 2026, 2);
    const prefix = cells.slice(
      0,
      cells.findIndex((c) => c.inMonth),
    );
    prefix.forEach((c) => expect(c.day).toBeNull());
  });
});

// ── getWeekDays ────────────────────────────────────────────────────────────────

describe('getWeekDays', () => {
  it('returns exactly 7 days', () => {
    const days = getWeekDays('gregory', 2026, 2, 10);
    expect(days).toHaveLength(7);
  });

  it('all 7 days have valid ISO strings', () => {
    const days = getWeekDays('gregory', 2026, 2, 10);
    days.forEach((d) => {
      expect(d.iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('the 7 ISO dates are consecutive', () => {
    const days = getWeekDays('gregory', 2026, 2, 10);
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1].iso);
      const curr = new Date(days[i].iso);
      const diffMs = curr.getTime() - prev.getTime();
      expect(diffMs).toBe(86_400_000); // exactly one day
    }
  });

  it('starts the week on Sunday for Gregorian (firstDayOfWeek = 0)', () => {
    const days = getWeekDays('gregory', 2026, 2, 10); // Tuesday Mar 10
    expect(days[0].dow).toBe(0); // Sunday
    expect(days[6].dow).toBe(6); // Saturday
  });

  it('starts the week on Saturday for Persian (firstDayOfWeek = 6)', () => {
    const days = getWeekDays('persian', 1404, 11, 20);
    expect(days[0].dow).toBe(6); // Saturday
  });

  it('contains the anchor date somewhere in the week', () => {
    const days = getWeekDays('gregory', 2026, 2, 10);
    const isos = days.map((d) => d.iso);
    expect(isos).toContain('2026-03-10');
  });
});

// ── getTodayISO ────────────────────────────────────────────────────────────────

describe('getTodayISO', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(getTodayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the current local date', () => {
    const t = new Date();
    const expected = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    expect(getTodayISO()).toBe(expected);
  });
});

// ── CALENDAR_SYSTEMS structure ─────────────────────────────────────────────────

describe('CALENDAR_SYSTEMS', () => {
  const systems = Object.values(CALENDAR_SYSTEMS);

  it('defines exactly 4 calendar systems', () => {
    expect(systems).toHaveLength(4);
  });

  it('each system has required fields', () => {
    systems.forEach((cs) => {
      expect(cs.key).toBeTruthy();
      expect(cs.label).toBeTruthy();
      expect(Array.isArray(cs.months)).toBe(true);
      expect(Array.isArray(cs.daysOfWeek)).toBe(true);
      expect(cs.daysOfWeek).toHaveLength(7);
      expect(typeof cs.getDaysInMonth).toBe('function');
      expect(typeof cs.toGregorian).toBe('function');
      expect(typeof cs.fromGregorian).toBe('function');
    });
  });

  it('each system getDaysInMonth returns values in range [28,31] for standard months', () => {
    systems.forEach((cs) => {
      const monthCount = cs.key === 'ethiopic' ? 12 : cs.monthsInYear; // skip Pagume
      for (let m = 0; m < monthCount; m++) {
        const days = cs.getDaysInMonth(2026, m);
        expect(days).toBeGreaterThanOrEqual(28);
        expect(days).toBeLessThanOrEqual(31);
      }
    });
  });
});
