import React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import MonthlyViewWorkload from './monthly-workload-view.component';
import MonthlyHeader from './monthly-header.module';
import styles from '../appointments-calendar-view-view.scss';

dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  currentDate: Dayjs;
  setCurrentDate: (date) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events, currentDate, setCurrentDate }) => {
  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(currentDate).map((dateTime, i) => (
            <MonthlyViewWorkload key={i} dateTime={dateTime} currentDate={currentDate} events={events} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
