import { Dayjs } from 'dayjs';
import React from 'react';
import { CalendarType } from '../../utils/types';
import DaysOfWeekCard from '../Cell/DaysOfWeek';
import styles from './MonthlyHeader.module.scss';

const Format = {
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
} as const;

const monthFormat = 'MMM, YYYY';
const dateFormat = 'D MMM';
var dayy = '';
const dayss = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function MonthlyHeader({
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
      <div className={styles.workLoadCard}>
        {dayss?.map((dayy) => {
          return <DaysOfWeekCard dayOfWeek={dayy} />;
        })}
      </div>
    </>
  );
}
export default MonthlyHeader;
