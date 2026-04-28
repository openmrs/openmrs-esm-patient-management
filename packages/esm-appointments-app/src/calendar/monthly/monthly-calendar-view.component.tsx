import React, { useCallback } from 'react';
import isBetween from 'dayjs/plugin/isBetween';
import dayjs, { type Dayjs } from 'dayjs';
import { type DailyAppointmentsCountByService } from '../../types';
import { monthDays } from '../../helpers';
import MonthlyHeader from './monthly-header.component';
import MonthlyViewWorkload from './monthly-workload-view.component';
import styles from '../appointments-calendar-view-view.scss';

dayjs.extend(isBetween);

interface MonthlyCalendarViewProps {
  events: Array<DailyAppointmentsCountByService>;
  calendarSelectedDate: Dayjs;
  setCalendarSelectedDate: React.Dispatch<React.SetStateAction<Dayjs>>;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  events,
  calendarSelectedDate,
  setCalendarSelectedDate,
}) => {
  const handleSelectPrevMonth = useCallback(() => {
    setCalendarSelectedDate((prev) => prev.subtract(1, 'month'));
  }, [setCalendarSelectedDate]);

  const handleSelectNextMonth = useCallback(() => {
    setCalendarSelectedDate((prev) => prev.add(1, 'month'));
  }, [setCalendarSelectedDate]);

  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader
        calendarSelectedDate={calendarSelectedDate}
        onSelectPrevMonth={handleSelectPrevMonth}
        onSelectNextMonth={handleSelectNextMonth}
      />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {monthDays(calendarSelectedDate).map((dateTime, i) => (
            <MonthlyViewWorkload
              key={i}
              dateTime={dateTime}
              events={events}
              calendarSelectedDate={calendarSelectedDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
