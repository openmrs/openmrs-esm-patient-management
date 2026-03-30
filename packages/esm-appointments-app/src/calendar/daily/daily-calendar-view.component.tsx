import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import MonthlyHeader from '../monthly/monthly-header.component';
import DailyWorkloadView from './daily-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';
import { type DailyAppointmentsCountByService } from '../../types';
import { useSelectedDate } from '../../hooks/useSelectedDate';

interface DailyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ events }) => {
  /* Get globally selected date for calendar synchronization */
  const selectedDate = useSelectedDate();

  /* Memoize parsed date to avoid unnecessary recalculations on re-render */
  const today = useMemo(() => dayjs(selectedDate), [selectedDate]);

  return (
    <div className={styles.calendarViewContainer}>
      {/* Render header configured for daily view mode */}
      <MonthlyHeader mode="daily" />

      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {/* Render daily workload with selected date and event data */}
          <DailyWorkloadView dateTime={today} events={events} />
        </div>
      </div>
    </div>
  );
};

export default DailyCalendarView;
