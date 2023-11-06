import dayjs from 'dayjs';
import React from 'react';
import styles from './days-of-week.scss';

interface DaysOfWeekProp {
  dayOfWeek: string;
}
const DaysOfWeekCard: React.FC<DaysOfWeekProp> = ({ dayOfWeek }) => {
  const isToday = dayjs(new Date()).format('ddd').toUpperCase() === dayOfWeek;
  return (
    <div tabIndex={0} role="button" className={styles.tileContainer}>
      <span className={isToday ? styles.bold : ''}>{dayOfWeek}</span>
    </div>
  );
};
export default DaysOfWeekCard;
