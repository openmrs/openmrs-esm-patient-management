import React, { useState } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import styles from './Calendar.module.scss';
import { monthDays } from '../../functions/monthly';
import MonthlyCell from '../Cell/MonthlyCell';
import MonthlyHeader from '../Header/MonthlyHeader';
import { CalendarType } from '../../../types';
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
              <MonthlyCell type={type} key={i} dateTime={dateTime} currentDate={currentDate} events={events} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
