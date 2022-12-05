import React, { useState } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { CalendarType } from '../types';
import { monthDays } from '../helpers/functions';
import styles from './appointments-calendar-list-view.scss';
import MonthlyWorkload from './monthly-view-workload.component';
import MonthlyHeader from './monthly-header.module';
dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  type: CalendarType;
  events: { appointmentDate: string; service: Array<any>; [key: string]: any }[];
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ type, events }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  return (
    <div style={{ margin: '1rem' }}>
      <MonthlyHeader type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <div className={styles.wrapper}>
        {type === 'monthly' ? (
          <div className={styles['monthly-calendar']}>
            {monthDays(currentDate).map((dateTime, i) => (
              <MonthlyWorkload type={type} key={i} dateTime={dateTime} currentDate={currentDate} events={events} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
