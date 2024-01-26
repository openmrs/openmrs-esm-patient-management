import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import styles from './weekly-calendar.scss';
import { CalendarType, DailyAppointmentsCountByService } from '../../types';
import { isSameMonth, weekAllDays, weekDays } from '../../helpers';
import WeeklyWorkloadView from './weekly-workload-view.component';
import WeeklyHeader from './weekly-header.component';
dayjs.extend(isBetween);

interface WeeklyCalendarViewProps {
  type: CalendarType;
  events: Array<DailyAppointmentsCountByService>;
  currentDate: Dayjs;
  setCurrentDate: (date) => void;
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  type = 'weekly',
  events,
  currentDate,
  setCurrentDate,
}) => {
  return (
    <div className={styles.container}>
      <WeeklyHeader type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <div className={styles.wrapper}>
        <>
          <p className={styles['weekly-calendar']}>
            {weekDays(currentDate).map((dateTime, i) => {
              return (
                <>
                  <WeeklyWorkloadView
                    type={type}
                    key={i}
                    dateTime={dateTime}
                    currentDate={currentDate}
                    events={events}
                    index={i}
                  />
                </>
              );
            })}
          </p>
          {/* displays hours of day but commented out because showing the appts by hour is not currently implemented within this code
         <p className={styles['weekly-calendar-all']}>
            {weekAllDays(currentDate).map((dateTime, i) => (
              <>
                <div
                  className={
                    styles[
                      type === 'weekly'
                        ? 'weekly-cell'
                        : isSameMonth(dateTime, currentDate)
                        ? 'monthly-cell'
                        : 'monthly-cell-disabled'
                    ]
                  }>
                  {type === 'weekly' ? (
                    <>{<small className={styles['week-time']}>{dateTime.minute(0).format('h a')}</small>}</>
                  ) : null}
                </div>
              </>
            ))}
          </p>*/}
        </>
      </div>
    </div>
  );
};

export default WeeklyCalendarView;
