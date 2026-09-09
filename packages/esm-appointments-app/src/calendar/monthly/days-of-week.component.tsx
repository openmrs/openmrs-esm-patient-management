import React from 'react';
import classNames from 'classnames';
import styles from './days-of-week.scss';

interface DaysOfWeekProps {
  dayOfWeek: string;
  isToday?: boolean;
}
const DaysOfWeekCard: React.FC<DaysOfWeekProps> = ({ dayOfWeek, isToday = false }) => {
  return (
    <div tabIndex={0} role="button" className={styles.tileContainer}>
      <span className={classNames({ [styles.bold]: isToday })}>{dayOfWeek}</span>
    </div>
  );
};

export default DaysOfWeekCard;
