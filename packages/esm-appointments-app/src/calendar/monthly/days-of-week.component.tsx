import React from 'react';
import classNames from 'classnames';
import styles from './days-of-week.scss';

// Translations for the days of the week
// t('MON', 'MON');
// t('TUE', 'TUE');
// t('WED', 'WED');
// t('THUR', 'THUR');
// t('FRI', 'FRI');
// t('SAT', 'SAT');
// t('SUN', 'SUN');

interface DaysOfWeekProps {
  dayOfWeek: string;
  isToday: boolean;
}

const DaysOfWeekCard: React.FC<DaysOfWeekProps> = ({ dayOfWeek, isToday }) => {
  return (
    <div tabIndex={0} role="button" className={styles.tileContainer}>
      <span className={classNames({ [styles.bold]: isToday })}>{dayOfWeek}</span>
    </div>
  );
};
export default DaysOfWeekCard;
