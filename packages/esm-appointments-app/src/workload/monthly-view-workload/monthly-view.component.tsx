import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@openmrs/esm-framework';
import { getLocale, getDefaultCalendar } from '@openmrs/esm-utils';
import {
  parseDate,
  toCalendar,
  createCalendar,
  getLocalTimeZone,
  toCalendarDate,
  today,
} from '@internationalized/date';
import { monthDays } from '../../helpers';
import { useAppointmentsStore } from '../../store';
import DaysOfWeekCard from '../../calendar/monthly/days-of-week.component';
import MonthlyWorkloadCard from './monthlyWorkCard';
import styles from './monthly-workload.scss';

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
  const { t } = useTranslation();
  const { selectedDate } = useAppointmentsStore();
  const calendar = createCalendar(getDefaultCalendar(getLocale()));
  const date = toCalendar(parseDate(selectedDate.split('T')[0]), calendar);
  const daysInWeek = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
  const todayDate = toCalendarDate(today(getLocalTimeZone()));
  const todayShort = new Intl.DateTimeFormat(getLocale(), { weekday: 'short' })
    .format(todayDate.toDate(getLocalTimeZone()))
    .toUpperCase();

  const daysInWeeks = daysInWeek.map((day) => ({
    label: t(day),
    isToday: day === todayShort,
  }));

  const monthViewDate =
    dateToDisplay === '' ? toCalendarDate(date) : toCalendar(parseDate(dateToDisplay.split('T')[0]), calendar);
  // const daysInWeeks = daysInWeek.map((day) => t(day));

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
                  isActive={
                    toCalendar(parseDate(dateToDisplay.split('T')[0]), calendar).toString() === dateTime.toString()
                  }
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
