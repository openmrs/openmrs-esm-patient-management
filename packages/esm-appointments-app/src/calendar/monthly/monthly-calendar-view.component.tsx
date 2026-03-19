import React from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import MonthlyViewWorkload from './monthly-workload-view.component';
import DaysOfWeekCard from './days-of-week.component';
import styles from '../appointments-calendar-view-view.scss';

dayjs.extend(isBetween);

const DAYS_IN_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  /**
   * The ISO date (YYYY-MM-DD) representing the month to display.
   * Driven by the parent orchestrator's navDate state so that calendar-system
   * switching and Prev/Next navigation work correctly.
   */
  navIsoDate: string;
  /**
   * Called when a day cell with appointments is clicked.
   * Receives the ISO date (YYYY-MM-DD). Opens the modal instead of navigating away.
   */
  onSelectDate?: (isoDate: string) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events, navIsoDate, onSelectDate }) => {
  return (
    <div className={styles.calendarViewContainer}>
      {/* Days-of-week column labels */}
      <div className={styles.workLoadCard}>
        {DAYS_IN_WEEK.map((day) => (
          <DaysOfWeekCard key={day} dayOfWeek={day} />
        ))}
      </div>
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(dayjs(navIsoDate)).map((dateTime, i) => (
            <MonthlyViewWorkload
              key={i}
              dateTime={dateTime}
              events={events}
              navIsoDate={navIsoDate}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
