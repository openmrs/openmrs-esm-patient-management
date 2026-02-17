import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@openmrs/esm-framework';
import { getLocalTimeZone, toCalendarDate, today, type CalendarDate } from '@internationalized/date';
import { monthDays } from '../../helpers';
import { getSelectedCalendarDate, locale } from '../../store';
import DaysOfWeekCard from '../../calendar/monthly/days-of-week.component';
import MonthlyWorkloadCard from './monthlyWorkCard';
import styles from './monthly-workload.scss';

interface MonthlyCalendarViewProps {
  calendarWorkload: Array<{ count: number; date: string }>;
  dateToDisplay?: CalendarDate;
  onDateClick?: (pickedDate: Date) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ calendarWorkload, dateToDisplay, onDateClick }) => {
  const { t } = useTranslation();
  const date = getSelectedCalendarDate();
  const todayDate = toCalendarDate(today(getLocalTimeZone()));
  const todayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    .format(todayDate.toDate(getLocalTimeZone()))
    .toUpperCase();

  const daysInWeeks = React.useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

    const baseDate = new Date(Date.UTC(2021, 7, 1));

    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(baseDate);
      date.setUTCDate(baseDate.getUTCDate() + index);

      const label = formatter.format(date).toUpperCase();
      return {
        label,
        isToday: label === todayShort,
      };
    });
  }, [todayShort]);

  const monthViewDate: CalendarDate = dateToDisplay ?? date;

  const handleClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div className={styles.calendarViewContainer}>
      <>
        <div className={styles.container}></div>
        <span className={styles.headerContainer}>
          {formatDate(monthViewDate.toDate(getLocalTimeZone()), { day: false, time: false, noToday: true })}
        </span>
        <div className={styles.workLoadCard}>
          {daysInWeeks.map(({ label, isToday }, i) => (
            <DaysOfWeekCard key={`${label}-${i}`} dayOfWeek={label} isToday={isToday} />
          ))}
        </div>
        <div className={styles.wrapper}>
          <div className={styles.monthlyCalendar}>
            {monthDays(monthViewDate).map((dateTime, i) => (
              <div
                onClick={() => handleClick(dateTime.toDate(getLocalTimeZone()))}
                key={i}
                className={`${styles.monthlyWorkloadCard} ${
                  dateTime.toString() === monthViewDate.toString() ? styles.selectedDate : ''
                }`}>
                <MonthlyWorkloadCard
                  key={i}
                  date={dateTime}
                  isActive={dateToDisplay.toString() === dateTime.toString()}
                  count={calendarWorkload.find((calendar) => calendar.date === dateTime.toString())?.count ?? 0}
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
