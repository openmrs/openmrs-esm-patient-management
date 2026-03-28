import React from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { type Appointment, type DailyAppointmentsCountByService } from '../../types';
import { useAppointmentsStore } from '../../store';
import { monthDays } from '../../helpers';
import MonthlyViewWorkload from './monthly-workload-view.component';
import MonthlyHeader from './monthly-header.component';
import { useSelectedDate } from '../../hooks/useSelectedDate';
import styles from '../appointments-calendar-view-view.scss';

dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  appointments: Array<Appointment>;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events, appointments }) => {
  const { selectedDate } = useAppointmentsStore();

  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(dayjs(selectedDate)).map((dateTime, i) => (
            <MonthlyViewWorkload key={i} dateTime={dateTime} events={events} appointments={appointments} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
