import React from 'react';
import dayjs from 'dayjs';
import MonthlyHeader from '../monthly/monthly-header.component';
import MonthlyWorkloadView from '../monthly/monthly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';
import { useAppointmentsStore } from '../../store';

/* Weekly calendar view reusing monthly workload component for consistent UI */
const WeeklyCalendarView = ({ events }) => {
  /* Use selectedDate from global store to determine correct week range */
  const { selectedDate } = useAppointmentsStore();

  const startOfWeek = dayjs(selectedDate).startOf('week');

  /* Generate 7 days for the selected week */
  const days = Array.from({ length: 7 }).map((_, i) => startOfWeek.add(i, 'day'));

  return (
    <div className={styles.calendarViewContainer}>
      {/* Reuse shared header with weekly mode for navigation and weekday labels */}
      <MonthlyHeader mode="weekly" />

      <div className={styles.wrapper}>
        {/* Reuse monthly grid layout (7 columns) for weekly view */}
        <div className={styles.monthlyCalendar}>
          {days.map((day) => (
            <MonthlyWorkloadView key={day.toString()} dateTime={day} events={events} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
