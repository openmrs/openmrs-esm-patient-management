import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo } from 'react';
import { CalendarType } from '../../utils/types';
import DaysOfWeekCard from '../Cell/DaysOfWeek';
import styles from './MonthlyHeader.module.scss';

const Format = {
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
} as const;

const monthFormat = 'MMMM, YYYY';
const dateFormat = 'D MMM';
const startOfWeek = dayjs().startOf('week');

const weekdays = new Array(7).fill(startOfWeek).map((day, idx) => day.add(idx, 'day').format('dddd DD/YY'));
function WeeklyHeader({
  type,
  currentDate,
  setCurrentDate,
}: {
  type: CalendarType;
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
}) {
  return (
    <>
      <div className={styles.container}>
        <button onClick={() => setCurrentDate(currentDate.subtract(1, Format[type]))}>prev</button>
        <span>
          {type === 'monthly'
            ? currentDate.format(monthFormat)
            : type === 'daily'
            ? currentDate.format(dateFormat)
            : `${currentDate.startOf('week').format(dateFormat)} - ${currentDate.endOf('week').format(dateFormat)}`}
        </span>
        <button onClick={() => setCurrentDate(currentDate.add(1, Format[type]))}>next</button>
      </div>
    </>
  );
}
export default WeeklyHeader;
