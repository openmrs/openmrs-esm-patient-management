import { Dayjs } from 'dayjs';
import { CalendarType } from '../../utils/types';
import { isSameMonth } from '../../functions/monthly';
import styles from './MonthlyCell.module.scss';
import React from 'react';

function MonthlyCell({ type, dateTime, currentDate }: { type: CalendarType; dateTime: Dayjs; currentDate: Dayjs }) {
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
      {type === 'monthly' ? dateTime.format('D') : null}
    </div>
  );
}
export default MonthlyCell;
