import React from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { useLayoutType } from '@openmrs/esm-framework';
import { isSameMonth } from '../../helpers';
import styles from './monthly-workload.scss';

interface MonthlyWorkloadComponentProps {
  date: Dayjs;
  count: number;
  isActive: boolean;
  selectedDate?: Dayjs;
}

const MonthlyWorkloadCard: React.FC<MonthlyWorkloadComponentProps> = ({ date, count, isActive, selectedDate }) => {
  const layout = useLayoutType();
  const isToday = date.isSame(dayjs(), 'day');
  return (
    <div
      className={classNames(
        styles['monthly-cell'],
        {
          [styles['monthly-cell-selected']]: isSameMonth(date, dayjs(selectedDate)),
          [styles['monthly-cell-current']]: isSameMonth(date, dayjs(selectedDate)),
          [styles['monthly-cell-current']]: isSameMonth(date, selectedDate),
          [styles['monthly-cell-active']]: isActive,
        },
        {
          [styles.smallDesktop]: layout === 'small-desktop',
          [styles.largeDesktop]: layout !== 'small-desktop',
        },
      )}>
      <p>
        <b className={[styles.calendarDate, isToday ? styles.blue : ''].join(' ')}>{date.format('D')}</b>
        <div className={styles.currentData}>
          <div tabIndex={0} role="button" className={classNames(styles.tileContainer, {})}></div>
          <div className={styles.serviceArea}>
            <span className={isActive ? styles.blue : ''}>{count}</span>
          </div>
        </div>
      </p>
    </div>
  );
};
export default MonthlyWorkloadCard;
