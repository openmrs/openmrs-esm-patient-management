import { Dayjs } from 'dayjs';
import { CalendarType } from '../../utils/types';
import { isSameMonth } from '../../functions/monthly';
import styles from './DailyCell.module.scss';
import React from 'react';

function DailyCell({ type, dateTime, currentDate }: { type: CalendarType; dateTime: Dayjs; currentDate: Dayjs }) {
  return (
    <div className={styles[type === 'daily' ? 'daily-cell' : '']}>
      {type === 'daily' ? <small>{dateTime.minute(0).format('h:mm a')}</small> : null}
    </div>
  );
}
export default DailyCell;
