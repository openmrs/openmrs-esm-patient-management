import { Dayjs } from 'dayjs';
import React from 'react';
import { CalendarType } from '../../utils/types';
import styles from './DailyHeader.module.scss';

const Format = {
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
} as const;

const monthFormat = 'MMM, YYYY';
const dateFormat = 'D MMM';

function DailyHeader({
  type,
  currentDate,
  setCurrentDate,
}: {
  type: CalendarType;
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
}) {
  return (
    <div className={styles.container}>
      <button onClick={() => setCurrentDate(currentDate.subtract(1, Format[type]))}>prev</button>
      <span>
        {type === 'daily'
          ? currentDate.format(dateFormat)
          : `${currentDate.startOf('day').format(dateFormat)} - ${currentDate.endOf('day').format(dateFormat)}`}
      </span>
      <button onClick={() => setCurrentDate(currentDate.add(1, Format[type]))}>next</button>
    </div>
  );
}
export default DailyHeader;
