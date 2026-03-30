import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@openmrs/esm-framework';
import { monthDays } from '../../helpers';
import DaysOfWeekCard from '../../calendar/monthly/days-of-week.component';
import MonthlyWorkloadCard from './monthlyWorkCard';
import styles from './monthly-workload.scss';
import { useSelectedDate } from '../../hooks/useSelectedDate';

interface MonthlyCalendarViewProps {
  calendarWorkload: Array<{ count: number; date: string }>;
  dateToDisplay?: string;
  onDateClick?: (pickedDate: Date) => void;
}

/* Static weekday labels for header rendering */
const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  calendarWorkload,
  dateToDisplay = '',
  onDateClick,
}) => {
  /* Enable translation support */
  const { t } = useTranslation();

  /* Get selected date from global state */
  const selectedDate = useSelectedDate();

  /* Resolve which date should drive the month view */
  const monthViewDate = dateToDisplay || selectedDate;

  /* Handle user clicking on a specific date */
  const handleClick = (date: Date) => {
    onDateClick?.(date);
  };

  return (
    <div className={styles.calendarViewContainer}>
      <>
        <div className={styles.container}></div>

        {/* Display formatted month/year header */}
        <span className={styles.headerContainer}>
          {formatDate(new Date(monthViewDate), {
            day: false,
            time: false,
            noToday: true,
          })}
        </span>

        {/* Render weekday headers */}
        <div className={styles.workLoadCard}>
          {DAYS_IN_WEEK.map((day) => (
            <DaysOfWeekCard key={day} dayOfWeek={day} />
          ))}
        </div>

        <div className={styles.wrapper}>
          <div className={styles.monthlyCalendar}>
            {/* Render full calendar grid including overflow days */}
            {monthDays(dayjs(monthViewDate)).map((dateTime) => {
              const formatted = dayjs(dateTime).format('YYYY-MM-DD');

              /* Check if this date is currently selected */
              const isSelected = formatted === dayjs(monthViewDate).format('YYYY-MM-DD');

              /* Lookup workload count for the given date */
              const count = calendarWorkload.find((c) => c.date === formatted)?.count ?? 0;

              return (
                <div
                  key={formatted} /* Ensure stable rendering key */
                  onClick={() => handleClick(dayjs(dateTime).toDate())}
                  className={`${styles.monthlyWorkloadCard} ${isSelected ? styles.selectedDate : ''}`}>
                  <MonthlyWorkloadCard date={dateTime} isActive={isSelected} count={count} />
                </div>
              );
            })}
          </div>
        </div>
      </>
    </div>
  );
};

export default MonthlyCalendarView;
