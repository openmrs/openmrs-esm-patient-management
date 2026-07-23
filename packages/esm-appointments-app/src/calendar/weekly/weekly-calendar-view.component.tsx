import React, { useMemo } from 'react';
import { type Dayjs } from 'dayjs';
import {
  parseDate,
  toCalendar,
  getDayOfWeek,
  startOfWeek,
  today,
  getLocalTimeZone,
  GregorianCalendar,
  EthiopicCalendar,
  IslamicCivilCalendar,
  PersianCalendar,
  type Calendar,
} from '@internationalized/date';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import { TIME_BLOCKS } from '../utils/calendar-colors';
import WeeklySlotCell from './weekly-slot-cell.component';
import { LOCALE_MAP } from '../calendar-utils';
import styles from './weekly-calendar-view.scss';

const DAY_OF_WEEK_KEY: Record<number, 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

function getCalendar(calKey: string): Calendar {
  switch (calKey) {
    case 'ethiopic':
      return new EthiopicCalendar();
    case 'islamic':
      return new IslamicCivilCalendar();
    case 'persian':
      return new PersianCalendar();
    default:
      return new GregorianCalendar();
  }
}

interface WeekDay {
  iso: string;
  day: number;
  month: number;
  year: number;
  dow: number;
}

interface WeeklyCalendarViewProps {
  calKey: string;
  calendarSelectedDate: Dayjs;
  onSelectDate: (isoDate: string, startHour: number, endHour: number) => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ calKey, calendarSelectedDate, onSelectDate }) => {
  const todayISO = today(getLocalTimeZone()).toString();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const locale = LOCALE_MAP[calKey] ?? 'en-US';
  const cal = useMemo(() => getCalendar(calKey), [calKey]);

  const weekDays: ReadonlyArray<WeekDay> = useMemo(() => {
    const pivot = parseDate(isoDate);
    const firstDay = calKey === 'persian' ? 6 : 0;
    const weekStart = startOfWeek(pivot, 'en-US', DAY_OF_WEEK_KEY[firstDay]);
    return Array.from({ length: 7 }, (_, i) => {
      const gregDay = weekStart.add({ days: i });
      const calDay = toCalendar(gregDay, cal);
      return {
        iso: gregDay.toString(),
        day: calDay.day,
        month: calDay.month,
        year: calDay.year,
        dow: getDayOfWeek(gregDay, 'en-US', 'sun'),
      };
    });
  }, [isoDate, cal, calKey]);

  const day0 = useAppointmentsByDate(weekDays[0].iso);
  const day1 = useAppointmentsByDate(weekDays[1].iso);
  const day2 = useAppointmentsByDate(weekDays[2].iso);
  const day3 = useAppointmentsByDate(weekDays[3].iso);
  const day4 = useAppointmentsByDate(weekDays[4].iso);
  const day5 = useAppointmentsByDate(weekDays[5].iso);
  const day6 = useAppointmentsByDate(weekDays[6].iso);
  const dayData = [day0, day1, day2, day3, day4, day5, day6];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.cornerCell} />
        {weekDays.map((wd) => {
          const isToday = wd.iso === todayISO;
          const [y, m, d] = wd.iso.split('-').map(Number);
          const jsDate = new Date(y, m - 1, d);
          const dowLabel = new Intl.DateTimeFormat(locale, { weekday: 'short', calendar: calKey }).format(jsDate);
          const monthName = new Intl.DateTimeFormat('en-US', { month: 'short', calendar: calKey }).format(jsDate);
          return (
            <div key={wd.iso} className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ''}`}>
              <div className={styles.dowLabel}>{dowLabel}</div>
              <div className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ''}`}>{wd.day}</div>
              <div className={styles.monthLabel}>{monthName}</div>
            </div>
          );
        })}

        {TIME_BLOCKS.map((block) => (
          <React.Fragment key={block.label}>
            <div className={styles.timeLabel}>{block.label}</div>
            {weekDays.map((wd, dayIdx) => (
              <WeeklySlotCell
                key={wd.iso}
                appointments={dayData[dayIdx].appointments}
                isoDate={wd.iso}
                startHour={block.startHour}
                endHour={block.endHour}
                isToday={wd.iso === todayISO}
                onSelectDate={onSelectDate}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
