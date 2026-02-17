import React from 'react';
import { type Calendar } from '@internationalized/date';
import { type DailyAppointmentsCountByService } from '../../types';
import { getSelectedCalendarDate } from '../../store';
import { monthDays } from '../../helpers';
import MonthlyViewWorkload from './monthly-workload-view.component';
import MonthlyHeader from './monthly-header.component';
import styles from '../appointments-calendar-view-view.scss';

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  calendar: Calendar;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events, calendar }) => {
  const date = getSelectedCalendarDate();

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
