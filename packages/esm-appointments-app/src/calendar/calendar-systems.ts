/**
 * calendar-systems.ts
 *
 * Universal Julian Day Number (JDN) based calendar conversion utilities.
 * Supports Gregorian, Ethiopic, Islamic (civil), and Persian (Solar Hijri) calendars.
 * Each calendar system follows the same interface so view components remain generic.
 */

// ─── JDN ↔ Gregorian ────────────────────────────────────────────────────────

export function gregorianToJdn(year: number, month: number, day: number): number {
  // month is 0-based (Jan = 0)
  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
}

export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const w = Math.floor((jdn - 1867216.25) / 36524.25);
  const x = Math.floor(w / 4);
  const a = jdn + 1 + w - x;
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const f = Math.floor(30.6001 * e);
  const day = b - d - f;
  const rawMonth = e - 1; // 1-based
  const month = rawMonth <= 12 ? rawMonth : rawMonth - 12; // 1-based
  const year = month <= 2 ? c - 4715 : c - 4716;
  return { year, month: month - 1, day }; // month returned 0-based
}

// ─── JDN ↔ Islamic (civil tabular) ──────────────────────────────────────────

export function islamicToJdn(year: number, month: number, day: number): number {
  // month is 0-based
  const m = month + 1;
  return Math.floor((11 * year + 3) / 30) + 354 * year + 30 * m - Math.floor((m - 1) / 2) + day + 1948440 - 385;
}

export function jdnToIslamic(jdn: number): { year: number; month: number; day: number } {
  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l3) / 709); // 1-based
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { year: y, month: m - 1, day: d }; // month returned 0-based
}

// ─── JDN ↔ Ethiopic ──────────────────────────────────────────────────────────

export function ethiopicToJdn(year: number, month: number, day: number): number {
  // month is 0-based (0 = Meskerem, 12 = Pagume)
  return 1723855 + 365 * year + Math.floor(year / 4) + 30 * month + day;
}

export function jdnToEthiopic(jdn: number): { year: number; month: number; day: number } {
  const r = jdn - 1723856;
  const n = r + 365 * 3;
  const year = Math.floor(n / 1461) * 4 + Math.floor((n % 1461) / 365) - 3;
  const daysInYear = jdn - ethiopicToJdn(year, 0, 1);
  const month = Math.floor(daysInYear / 30); // 0-based
  const day = daysInYear - month * 30 + 1;
  return { year, month, day };
}

// ─── JDN ↔ Persian (Solar Hijri / Jalali) ────────────────────────────────────

export function persianToJdn(year: number, month: number, day: number): number {
  // month is 0-based
  const epBase = year - (year >= 0 ? 474 : 473);
  const epYear = 474 + (((epBase % 2820) + 2820) % 2820);
  const mDays = month < 6 ? month * 31 : 186 + (month - 6) * 30;
  return (
    day +
    mDays +
    Math.floor((epYear * 682 - 110) / 2816) +
    (epYear - 1) * 365 +
    Math.floor(epBase / 2820) * 1029983 +
    1948320 -
    1
  );
}

export function jdnToPersian(jdn: number): { year: number; month: number; day: number } {
  const depoch = jdn - persianToJdn(475, 0, 1);
  const cycle = Math.floor(depoch / 1029983);
  const cyear = ((depoch % 1029983) + 1029983) % 1029983;
  let ycycle: number;
  if (cyear === 1029982) {
    ycycle = 2820;
  } else {
    const aux1 = Math.floor(cyear / 366);
    const aux2 = cyear % 366;
    ycycle = Math.floor((2134 * aux1 + 2816 * aux2 + 2815) / 1028522) + aux1 + 1;
  }
  let year = ycycle + 2820 * cycle + 474;
  if (year <= 0) year -= 1;
  const yday = jdn - persianToJdn(year, 0, 1) + 1;
  const month = yday <= 186 ? Math.floor((yday - 1) / 31) : Math.floor((yday - 187) / 30) + 6;
  const day = yday <= 186 ? yday - month * 31 : yday - 186 - (month - 6) * 30;
  return { year, month, day }; // month 0-based
}

// ─── Calendar System Definitions ─────────────────────────────────────────────

export interface CalendarDate {
  year: number;
  month: number; // 0-based
  day: number;
}

export interface CalendarSystem {
  /** Internal key used in config/state */
  key: string;
  /** Human-readable label for select dropdowns */
  label: string;
  /** Localised month names (index = 0-based month) */
  months: string[];
  /** Short day-of-week labels, starting from Sunday (index 0) */
  daysOfWeek: string[];
  /** 0 = Sunday, 1 = Monday, 6 = Saturday — first column of the week grid */
  firstDayOfWeek: number;
  /** Total months in a year (usually 12, Ethiopic has 13) */
  monthsInYear: number;
  /** Returns number of days in the given month of the given year */
  getDaysInMonth(year: number, month: number): number;
  /** Returns the Gregorian day-of-week (0=Sun) for day 1 of the given month */
  getFirstDayOfMonth(year: number, month: number): number;
  /** Convert a date in this calendar to a Gregorian { year, month(0-based), day } */
  toGregorian(year: number, month: number, day: number): CalendarDate;
  /** Convert a Gregorian date (month 0-based) to a date in this calendar */
  fromGregorian(year: number, month: number, day: number): CalendarDate;
}

export const CALENDAR_SYSTEMS: Record<string, CalendarSystem> = {
  gregory: {
    key: 'gregory',
    label: 'Gregorian',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    firstDayOfWeek: 0,
    monthsInYear: 12,
    getDaysInMonth: (y, m) => new Date(y, m + 1, 0).getDate(),
    getFirstDayOfMonth: (y, m) => (gregorianToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => ({ year: y, month: m, day: d }),
    fromGregorian: (y, m, d) => ({ year: y, month: m, day: d }),
  },

  ethiopic: {
    key: 'ethiopic',
    label: 'Ethiopic',
    months: [
      'Meskerem',
      'Tikimt',
      'Hidar',
      'Tahesas',
      'Tir',
      'Yekatit',
      'Megabit',
      'Miazia',
      'Ginbot',
      'Sene',
      'Hamle',
      'Nehase',
      'Pagume',
    ],
    daysOfWeek: ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'ዓር', 'ቅዳ'],
    firstDayOfWeek: 0,
    monthsInYear: 13,
    getDaysInMonth: (y, m) => (m === 12 ? (y % 4 === 3 ? 6 : 5) : 30),
    getFirstDayOfMonth: (y, m) => (ethiopicToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(ethiopicToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToEthiopic(gregorianToJdn(y, m, d)),
  },

  islamic: {
    key: 'islamic',
    label: 'Islamic (Civil)',
    months: [
      'Muharram',
      'Safar',
      'Rabi al-Awwal',
      'Rabi al-Thani',
      'Jumada al-Awwal',
      'Jumada al-Thani',
      'Rajab',
      "Sha'ban",
      'Ramadan',
      'Shawwal',
      "Dhu al-Qi'dah",
      'Dhu al-Hijjah',
    ],
    daysOfWeek: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    firstDayOfWeek: 0,
    monthsInYear: 12,
    getDaysInMonth: (y, m) => {
      if (m % 2 === 0) return 30;
      if (m === 11) {
        // Dhu al-Hijjah: 30 days in leap years
        const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
        return leapYears.includes(y % 30) ? 30 : 29;
      }
      return 29;
    },
    getFirstDayOfMonth: (y, m) => (islamicToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(islamicToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToIslamic(gregorianToJdn(y, m, d)),
  },

  persian: {
    key: 'persian',
    label: 'Persian (Solar Hijri)',
    months: [
      'Farvardin',
      'Ordibehesht',
      'Khordad',
      'Tir',
      'Mordad',
      'Shahrivar',
      'Mehr',
      'Aban',
      'Azar',
      'Dey',
      'Bahman',
      'Esfand',
    ],
    daysOfWeek: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
    firstDayOfWeek: 6, // Saturday is the first day of the Persian week
    monthsInYear: 12,
    getDaysInMonth: (y, m) => {
      if (m < 6) return 31;
      if (m < 11) return 30;
      const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
      return leapYears.includes(y % 33) ? 30 : 29;
    },
    getFirstDayOfMonth: (y, m) => (persianToJdn(y, m, 1) + 1) % 7,
    toGregorian: (y, m, d) => jdnToGregorian(persianToJdn(y, m, d)),
    fromGregorian: (y, m, d) => jdnToPersian(gregorianToJdn(y, m, d)),
  },
};

// ─── Utility helpers used by view components ─────────────────────────────────

/**
 * Returns the ISO date string (YYYY-MM-DD) for a given calendar date.
 */
export function calendarDateToISO(calSysKey: string, year: number, month: number, day: number): string {
  const cs = CALENDAR_SYSTEMS[calSysKey];
  const g = cs.toGregorian(year, month, day);
  return `${g.year}-${String(g.month + 1).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
}

/**
 * Converts an ISO date string to a calendar date in the given calendar system.
 */
export function isoToCalendarDate(calSysKey: string, isoDate: string): CalendarDate {
  const [gy, gm, gd] = isoDate.split('-').map(Number);
  return CALENDAR_SYSTEMS[calSysKey].fromGregorian(gy, gm - 1, gd);
}

/**
 * Returns the ordered cells for a monthly grid.
 * Empty prefix cells (before day 1) have `day: null`.
 */
export function getMonthGridCells(
  calSysKey: string,
  year: number,
  month: number,
): Array<{ day: number | null; inMonth: boolean }> {
  const cs = CALENDAR_SYSTEMS[calSysKey];
  const daysInMonth = cs.getDaysInMonth(year, month);
  const firstDow = cs.getFirstDayOfMonth(year, month);
  const offset = (firstDow - cs.firstDayOfWeek + 7) % 7;

  const cells: Array<{ day: number | null; inMonth: boolean }> = [];
  for (let i = 0; i < offset; i++) cells.push({ day: null, inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });
  while (cells.length % 7 !== 0) cells.push({ day: null, inMonth: false });
  return cells;
}

export interface WeekDay extends CalendarDate {
  /** ISO date string for this day */
  iso: string;
  /** Gregorian day-of-week 0=Sun */
  dow: number;
}

/**
 * Returns the 7 WeekDay objects for the week that contains the given calendar date.
 */
export function getWeekDays(calSysKey: string, year: number, month: number, day: number): WeekDay[] {
  const cs = CALENDAR_SYSTEMS[calSysKey];
  const g = cs.toGregorian(year, month, day);
  const pivot = new Date(g.year, g.month, g.day);
  const dow = pivot.getDay();
  const offset = (dow - cs.firstDayOfWeek + 7) % 7;
  const weekStart = new Date(g.year, g.month, g.day - offset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const cal = cs.fromGregorian(d.getFullYear(), d.getMonth(), d.getDate());
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { ...cal, iso, dow: d.getDay() } as WeekDay;
  });
}

/**
 * Today's date as an ISO string (YYYY-MM-DD) in local time.
 */
export function getTodayISO(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}
