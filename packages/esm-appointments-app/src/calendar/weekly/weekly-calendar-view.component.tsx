import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import MonthlyHeader from '../monthly/monthly-header.component';
import WeeklyWorkloadView from './weekly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';
import { type DailyAppointmentsCountByService } from '../../types';
import { useSelectedDate } from '../../hooks/useSelectedDate';

interface WeeklyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
}

/* Render calendar in weekly mode */
const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({ events }) => {
  /* Get globally selected date to anchor the week */
  const selectedDate = useSelectedDate();

  /* Compute all 7 days of the selected week */
  const days = useMemo(() => {
    const startOfWeek = dayjs(selectedDate).startOf('week');

    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  }, [selectedDate]);

  return (
    <div className={styles.calendarViewContainer}>
      {/* Render header configured for weekly navigation */}
      <MonthlyHeader mode="weekly" />

      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {/* Render workload data for each day of the week */}
          {days.map((day) => (
            <WeeklyWorkloadView key={day.format('YYYY-MM-DD')} dateTime={day} events={events} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
