import React from 'react';
import dayjs from 'dayjs';
import { monthDays } from '../../helpers';
import { useCalendarFormat, formatLocalDayNumber } from '../../calendar/calendar-utils';
import DaysOfWeekCard from '../../calendar/monthly/days-of-week.component';
import MonthlyWorkloadCard from './monthlyWorkCard';
import styles from './monthly-workload.scss';
import { useSelectedDate } from '../../hooks/useSelectedDate';

interface MonthlyCalendarViewProps {
  calendarWorkload: Array<{ count: number; date: string }>;
  dateToDisplay?: string;
  onDateClick?: (pickedDate: Date) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  calendarWorkload,
  dateToDisplay = '',
  onDateClick,
}) => {
  const selectedDate = useSelectedDate();
  const { locale, calendarId, calendar } = useCalendarFormat();
  const monthViewDate = dateToDisplay === '' ? selectedDate : dateToDisplay;

  // Localized month and year header string
  const [y, m, d] = dayjs(monthViewDate).format('YYYY-MM-DD').split('-').map(Number);
  const headerDateString = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    calendar: calendarId,
  } as Intl.DateTimeFormatOptions).format(new Date(y, m - 1, d, 12, 0, 0));

  // Ordered weekday names in the local calendar starting Sunday (Jan 4, 1970 was a Sunday)
  const daysInWeeks = Array.from({ length: 7 }, (_, i) => {
    const refDate = new Date(1970, 0, 4 + i);
    return new Intl.DateTimeFormat(locale, { weekday: 'short', calendar: calendarId } as Intl.DateTimeFormatOptions)
      .format(refDate)
      .toUpperCase();
  });

  const handleClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div className={styles.calendarViewContainer}>
      <>
        <div className={styles.container}></div>
        <span className={styles.headerContainer}>{headerDateString}</span>
        <div className={styles.workLoadCard}>
          {daysInWeeks?.map((day, i) => (
            <DaysOfWeekCard key={`${day}-${i}`} dayOfWeek={day} />
          ))}
        </div>
        <div className={styles.wrapper}>
          <div className={styles.monthlyCalendar}>
            {monthDays(dayjs(monthViewDate), calendar).map((dateTime, i) => (
              <div
                onClick={() => handleClick(dayjs(dateTime).toDate())}
                key={i}
                className={`${styles.monthlyWorkloadCard} ${
                  dayjs(dateTime).format('YYYY-MM-DD') === dayjs(monthViewDate).format('YYYY-MM-DD')
                    ? styles.selectedDate
                    : ''
                }`}>
                <MonthlyWorkloadCard
                  key={i}
                  date={dateTime}
                  isActive={dayjs(dateToDisplay).format('DD-MM-YYYY') === dayjs(dateTime).format('DD-MM-YYYY')}
                  locale={locale}
                  calendarId={calendarId}
                  calendar={calendar}
                  count={
                    calendarWorkload.find((calendar) => calendar.date === dayjs(dateTime).format('YYYY-MM-DD'))
                      ?.count ?? 0
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </>
    </div>
  );
};

export default MonthlyCalendarView;
