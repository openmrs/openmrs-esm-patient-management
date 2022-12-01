import { Dayjs } from 'dayjs';
import { CalendarType } from '../../utils/types';
import styles from './DailyCell.module.scss';
import React from 'react';
import { isSameMonth } from '../../functions/monthly';

function DailyCell({ type, dateTime, currentDate }: { type: CalendarType; dateTime: Dayjs; currentDate: Dayjs }) {
  return (
    <>
      <div className={styles[type === 'daily' ? 'daily-cell' : '']}>
        {type === 'daily' ? <small className={styles['day-time']}>{dateTime.minute(0).format('h: a')}</small> : null}
      </div>
    </>
  );
}
export default DailyCell;
