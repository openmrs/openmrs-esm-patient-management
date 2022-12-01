import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { CalendarType } from '../../utils/types';
import Header from '../Header';
import Cell from '../Cell';
import styles from './Calendar.module.scss';

import { topWeekDays, weekDays } from '../../functions/weekly';
import WeeklyCell from '../Cell/WeeklyCell';
import WeeklyTopCell from '../Cell/WeekTopCell';
import WeeklyHeader from '../Header/WeeklyHeader';
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
    <div>
      <WeeklyHeader type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <div className={styles.wrapper}>
        {type === 'weekly' ? (
          <div className={styles['weekly-calendar']}>
            {topWeekDays(currentDate).map((dateTime, i) => (
              <WeeklyTopCell type={type} key={i} dateTime={dateTime} currentDate={currentDate} events={events} />
            ))}
          </div>
        ) : null}
        {events.map((event, i) => {
          const weekStart = currentDate.startOf('week');
          const weekEnd = currentDate.endOf('week');

          const start = dayjs(event.startDateTime);
          const end = dayjs(event.endDateTime);

          const startDay = weekStart.isBefore(start) || weekStart.isSame(start) ? start.day() : 0;
          const endDay = weekEnd.isAfter(end) || weekEnd.isSame(end) ? end.day() + 1 : 7;

          const dateArr = [];

          let curr = start;

          while (curr.isBefore(end) || curr.isSame(end)) {
            dateArr.push(curr);
            curr = curr.add(1, 'day');
          }

          const height = (end.hour() * 60 + end.minute() - (start.hour() * 60 + start.minute())) * 2;
          const width = `calc(((100% - 60px) / 7) * ${endDay - startDay})`;
          const left = `calc((((100% - 60px) / 7)* ${startDay}) + 60px)`;

          return (
            <div
              key={i}
              style={{
                display: dateArr.some((date) => date.isBetween(weekStart, weekEnd)) ? 'inline-block' : 'none',
                position: 'absolute',
                top: start.hour() * 120 + start.minute() * 2,
                left: left,
                height: height,
                width: width,
                borderRadius: 6,
                background: 'lightblue',
              }}>
              {event.appointmentKind}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyCalendarView;
