import React from 'react';
import { parseDate, toCalendar, type Calendar } from '@internationalized/date';
import { type DailyAppointmentsCountByService } from '../../types';
import { useAppointmentsStore } from '../../store';
import { monthDays } from '../../helpers';
import MonthlyViewWorkload from './monthly-workload-view.component';
import MonthlyHeader from './monthly-header.component';
import styles from '../appointments-calendar-view-view.scss';

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  calendar: Calendar;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events, calendar }) => {
  const { selectedDate } = useAppointmentsStore();
  const date = toCalendar(parseDate(selectedDate.split('T')[0]), calendar);

  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(date).map((dateTime, i) => (
            <MonthlyViewWorkload key={i} dateTime={dateTime} events={events} calendar={calendar} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
