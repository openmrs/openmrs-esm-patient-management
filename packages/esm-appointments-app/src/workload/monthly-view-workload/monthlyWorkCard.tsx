import React from 'react';
import classNames from 'classnames';
import { useLayoutType } from '@openmrs/esm-framework';
import { type CalendarDate, getLocalTimeZone, today, isSameDay } from '@internationalized/date';
import { isSameCalendarMonth } from '../../helpers';
import styles from './monthly-workload.scss';
import { getSelectedCalendarDate } from '../../store';

interface MonthlyWorkloadComponentProps {
  date: CalendarDate;
  count: number;
  isActive: boolean;
}

const MonthlyWorkloadCard: React.FC<MonthlyWorkloadComponentProps> = ({ date, count, isActive }) => {
  const layout = useLayoutType();
  const isToday = isSameDay(date, today(getLocalTimeZone()));
  const dateSelected = getSelectedCalendarDate();

  return (
    <div
      className={classNames(
        styles['monthly-cell'],
        {
          [styles['monthly-cell-selected']]: isSameCalendarMonth(date, dateSelected),
          [styles['monthly-cell-current']]: isSameCalendarMonth(date, dateSelected),
          [styles['monthly-cell-current']]: isSameCalendarMonth(date, dateSelected),
          [styles['monthly-cell-active']]: isActive,
        },
        {
          [styles.smallDesktop]: layout === 'small-desktop',
          [styles.largeDesktop]: layout !== 'small-desktop',
        },
      )}>
      <div>
        <b className={[styles.calendarDate, isToday ? styles.blue : ''].join(' ')}>{date.day}</b>
        <div className={styles.currentData}>
          <div tabIndex={0} role="button" className={classNames(styles.tileContainer, {})}></div>
          <div className={styles.serviceArea}>
            <span className={isActive ? styles.blue : ''}>{count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MonthlyWorkloadCard;
