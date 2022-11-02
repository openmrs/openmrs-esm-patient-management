import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { CalendarType } from '../../utils/types';
import Header from '../Header';
import styles from './Calendar.module.scss';

import { dailyHours } from '../../functions/daily';
import { monthDays } from '../../functions/monthly';
import DailyCell from '../Cell/DailyCell';
dayjs.extend(isBetween);
function DailyCalendarView({
  type = 'daily',
  events,
}: {
  type: CalendarType;
  events: { start: string; end: string; [key: string]: any }[];
}) {
  const [currentDate, setCurrentDate] = useState(dayjs());

  return (
    <div>
      <Header type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <div className={styles.wrapper}>
        {type === 'daily' ? (
          <div className={styles['daily-calendar']}>
            {dailyHours(currentDate).map((dateTime, i) => (
              <DailyCell type={type} key={i} dateTime={dateTime} currentDate={currentDate} />
            ))}
          </div>
        ) : null}
        {events.map((event, i) => {
          const dayStart = currentDate.startOf('day');
          const dayEnd = currentDate.endOf('day');
          const start = dayjs(event.start);
          const end = dayjs(event.end);

          const startDay = dayStart.isBefore(start) || dayStart.isSame(start) ? start.day() : 0;
          const endDay = dayEnd.isAfter(end) || dayEnd.isSame(end) ? end.day() + 1 : 7;
          const dateArr = [];
          let curr = start;

          while (curr.isBefore(end) || curr.isSame(end)) {
            dateArr.push(curr);
            curr = curr.add(1, 'day');
          }

          const height = (end.hour() * 60 + end.minute() - (start.hour() * 60 + start.minute())) * 1;
          const width = `calc(((100% - 60px) / 7) * ${endDay - startDay})`;
          const left = `calc((((100% - 60px) / 10)* ${startDay}) + 60px)`;
          return (
            <div
              key={i}
              style={{
                display: dateArr.some((date) => date.isBetween(dayStart, dayEnd)) ? 'inline-block' : 'none',
                position: 'absolute',
                top: start.hour() * 120 + start.minute() * 2,
                left: left,
                height: height,
                width: width,
                borderRadius: 6,
                background: 'lightblue',
              }}>
              {event.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DailyCalendarView;
