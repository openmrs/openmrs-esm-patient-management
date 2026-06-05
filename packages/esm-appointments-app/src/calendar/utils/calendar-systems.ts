import {
  type Calendar,
  GregorianCalendar,
  EthiopicCalendar,
  IslamicCivilCalendar,
  PersianCalendar,
} from '@internationalized/date';

export interface CalendarSystemConfig {
  readonly key: string;
  readonly label: string;
  readonly calendar: Calendar;
  readonly months: ReadonlyArray<string>;
  readonly daysOfWeek: ReadonlyArray<string>;
  readonly firstDayOfWeek: number;
}

export const CALENDAR_SYSTEMS: Readonly<Record<string, CalendarSystemConfig>> = {
  gregory: {
    key: 'gregory',
    label: 'Gregorian',
    calendar: new GregorianCalendar(),
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
    daysOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    firstDayOfWeek: 0,
  },

  ethiopic: {
    key: 'ethiopic',
    label: 'Ethiopic',
    calendar: new EthiopicCalendar(),
    months: [
      'Meskerem',
      'Tikimt',
      'Hidar',
      'Tahesas',
      'Tir',
      'Yekatit',
      'Megabit',
      'Ginbot',
      'Miazia',
      'Sene',
      'Hamle',
      'Nehase',
      'Pagume',
    ],
    daysOfWeek: ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'ዓር', 'ቅዳ'],
    firstDayOfWeek: 0,
  },

  islamic: {
    key: 'islamic',
    label: 'Islamic (Civil)',
    calendar: new IslamicCivilCalendar(),
    months: [
      'Muharram',
      'Safar',
      "Rabi' al-Awwal",
      "Rabi' al-Thani",
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
  },

  persian: {
    key: 'persian',
    label: 'Persian (Solar Hijri)',
    calendar: new PersianCalendar(),
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
    firstDayOfWeek: 6,
  },
} as const;
