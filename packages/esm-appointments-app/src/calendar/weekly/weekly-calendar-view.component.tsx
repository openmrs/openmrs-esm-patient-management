import React, { useMemo } from 'react';
import { Tag } from '@carbon/react';
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
import { type Appointment } from '../../types';
import { useAppointmentsByDate } from '../../hooks/useAppointmentsByDate';
import {
  getServiceColor,
  STATUS_TAG_TYPES,
  DEFAULT_STATUS_TAG_TYPE,
  CALENDAR_HOURS,
  formatHourLabel,
} from '../utils/calendar-colors';
import styles from './weekly-calendar-view.scss';

const LOCALE_MAP: Record<string, string> = {
  gregory: 'en-US',
  ethiopic: 'am-ET',
  islamic: 'ar-SA',
  persian: 'fa-IR',
};

const DOW_LOCALE: Record<number, 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = {
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

interface WeeklyCalendarViewProps {
  calKey: string;
  calendarSelectedDate: Dayjs;
  onSelectDate: (isoDate: string) => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ calKey, calendarSelectedDate, onSelectDate }) => {
  const todayISO = today(getLocalTimeZone()).toString();
  const isoDate = calendarSelectedDate.format('YYYY-MM-DD');
  const locale = LOCALE_MAP[calKey] ?? 'en-US';
  const cal = useMemo(() => getCalendar(calKey), [calKey]);

  const weekDays = useMemo(() => {
    const pivot = parseDate(isoDate);
    const firstDay = calKey === 'persian' ? 6 : 0;
    const weekStart = startOfWeek(pivot, 'en-US', DOW_LOCALE[firstDay]);
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
        {CALENDAR_HOURS.map((hr) => (
          <React.Fragment key={hr}>
            <div className={styles.timeLabel}>{formatHourLabel(hr)}</div>
            {weekDays.map((wd) => (
              <WeeklySlotCell
                key={wd.iso}
                isoDate={wd.iso}
                hour={hr}
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

interface SlotCellProps {
  isoDate: string;
  hour: number;
  isToday: boolean;
  onSelectDate: (isoDate: string) => void;
}

const WeeklySlotCell: React.FC<SlotCellProps> = ({ isoDate, hour, isToday, onSelectDate }) => {
  const { appointments } = useAppointmentsByDate(isoDate);
  const slotAppts = useMemo(
    () => appointments.filter((a) => a.startDateTime != null && new Date(a.startDateTime).getHours() === hour),
    [appointments, hour],
  );

  const hasAppts = slotAppts.length > 0;

  return (
    <div
      role="button"
      tabIndex={hasAppts ? 0 : -1}
      aria-label={hasAppts ? `${slotAppts.length} appointments` : undefined}
      onClick={() => hasAppts && onSelectDate(isoDate)}
      onKeyDown={(e) => {
        if (hasAppts && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelectDate(isoDate);
        }
      }}
      className={`${styles.slotCell} ${isToday ? styles.slotCellToday : ''} ${hasAppts ? styles.slotCellHasAppts : ''}`}>
      {slotAppts.map((a) => (
        <div key={a.uuid} className={styles.chip} style={{ borderLeftColor: getServiceColor(a.service?.name ?? '') }}>
          <span className={styles.chipName}>{a.patient?.name ?? '—'}</span>
          <Tag type={STATUS_TAG_TYPES[a.status] ?? DEFAULT_STATUS_TAG_TYPE} size="sm">
            {a.status}
          </Tag>
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendarView;
