import { Dayjs } from 'dayjs';
import { CalendarType } from '../../utils/types';
import { isSameMonth } from '../../functions/monthly';
import styles from './WeeklyCell.module.scss';
import React from 'react';

function WeeklyCell({ type, dateTime, currentDate }: { type: CalendarType; dateTime: Dayjs; currentDate: Dayjs }) {
  return (
    <div
      className={
        styles[
          type === 'weekly'
            ? 'weekly-cell'
            : isSameMonth(dateTime, currentDate)
            ? 'monthly-cell'
            : 'monthly-cell-disabled'
        ]
      }>
      {type === 'weekly' ? (
        <small className={styles['week-time']}>{dateTime.minute(0).format('h:mm a')}</small>
      ) : type === 'monthly' ? (
        dateTime.format('D')
      ) : null}
    </div>
  );
}
export default WeeklyCell;
