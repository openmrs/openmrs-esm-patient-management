import React, { useMemo } from 'react';
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
  onSelectDate?: (isoDate: string) => void;
}

const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({ events, calendarSelectedDate, onSelectDate }) => {
  const gridDayCells = useMemo(() => monthDays(calendarSelectedDate), [calendarSelectedDate]);

  const eventsMap = useMemo(() => {
    const map = new Map<string, DailyAppointmentsCountByService>();

    events?.forEach((event) => {
      if (event.appointmentDate) {
        map.set(dayjs(event.appointmentDate).format('YYYY-MM-DD'), event);
      }
    });

    return map;
  }, [events]);

  return (
    <div className={styles.calendarViewContainer}>
      <MonthlyHeader />
      <div className={styles.wrapper}>
        <div className={styles.monthlyCalendar}>
          {gridDayCells.map((dateTime, i) => (
            <MonthlyViewWorkload
              key={i}
              index={i}
              dateTime={dateTime}
              events={events}
              eventsMap={eventsMap}
              calendarSelectedDate={calendarSelectedDate}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendarView;
