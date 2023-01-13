import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import styles from './weekly-calendar.scss';
import { CalendarType } from '../types';
import { isSameMonth, weekAllDays, weekDays } from '../helpers';
import WeeklyWorkloadView from './weekly-view-workload.component';
import WeeklyHeader from './weekly-header.component';
dayjs.extend(isBetween);
function WeeklyCalendarView({
  type = 'weekly',
  events,
}: {
  type: CalendarType;
  events: { appointmentDate: string; service: Array<any>; [key: string]: any }[];
}) {
  const [currentDate, setCurrentDate] = useState(dayjs());

  return (
    <div className={styles.container}>
      <WeeklyHeader type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} events={events} />
      <div className={styles.wrapper}>
        {type === 'weekly' ? (
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
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default WeeklyCalendarView;
