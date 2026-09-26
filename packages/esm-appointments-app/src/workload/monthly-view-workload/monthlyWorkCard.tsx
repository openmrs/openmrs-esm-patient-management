import React from 'react';
import classNames from 'classnames';
import dayjs, { type Dayjs } from 'dayjs';
import { useLayoutType } from '@openmrs/esm-framework';
import { type Calendar } from '@internationalized/date';
import { isSameMonth } from '../../helpers';
import { formatLocalDayNumber } from '../../calendar/calendar-utils';
import styles from './monthly-workload.scss';

interface MonthlyWorkloadComponentProps {
  date: Dayjs;
  count: number;
  isActive: boolean;
  selectedDate?: Dayjs;
  locale?: string;
  calendarId?: string;
  calendar?: Calendar;
}

const MonthlyWorkloadCard: React.FC<MonthlyWorkloadComponentProps> = ({
  date,
  count,
  isActive,
  selectedDate,
  locale = 'en',
  calendarId = 'gregory',
  calendar,
}) => {
  const layout = useLayoutType();
  const isToday = date.isSame(dayjs(), 'day');
  const dayNumber = formatLocalDayNumber(date.format('YYYY-MM-DD'), locale, calendarId);

  return (
    <div
      className={classNames(
        styles['monthly-cell'],
        {
          [styles['monthly-cell-selected']]: isSameMonth(date, dayjs(selectedDate), calendar),
          [styles['monthly-cell-current']]: isSameMonth(date, dayjs(selectedDate), calendar),
          [styles['monthly-cell-current']]: isSameMonth(date, selectedDate, calendar),
          [styles['monthly-cell-active']]: isActive,
        },
        {
          [styles.smallDesktop]: layout === 'small-desktop',
          [styles.largeDesktop]: layout !== 'small-desktop',
        },
      )}>
      <div>
        <b className={[styles.calendarDate, isToday ? styles.blue : ''].join(' ')}>{dayNumber}</b>
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
