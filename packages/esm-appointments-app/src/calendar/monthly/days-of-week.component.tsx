import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import styles from './days-of-week.scss';

interface DaysOfWeekProps {
  dayOfWeek: string;
}

const DaysOfWeekCard: React.FC<DaysOfWeekProps> = ({ dayOfWeek }) => {
  const isToday = dayjs(new Date()).format('ddd').toUpperCase() === dayOfWeek;
  return (
    <div tabIndex={0} role="button" className={styles.tileContainer}>
      <span className={classNames({ [styles.bold]: isToday })}>{dayOfWeek}</span>
    </div>
  );
};
export default DaysOfWeekCard;
