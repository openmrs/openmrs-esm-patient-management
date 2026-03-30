import React from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import MonthlyViewWorkload from './monthly-workload-view.component';
import MonthlyHeader from './monthly-header.component';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from '../appointments-calendar-view-view.scss';

/* Extend dayjs with range comparison functionality */
dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events }) => {
  /* Get globally selected date to determine current month */
  const selectedDate = useSelectedDate();

  /* Generate all calendar days (including padding days) for the month view */
  const days = monthDays(dayjs(selectedDate));

  return (
    <div className={styles.calendarViewContainer}>
      {/* Render default monthly header */}
      <MonthlyHeader />

      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {/* Render each day cell with corresponding workload data */}
          {days.map((dateTime) => (
            <MonthlyViewWorkload key={dateTime.format('YYYY-MM-DD')} dateTime={dateTime} events={events} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
