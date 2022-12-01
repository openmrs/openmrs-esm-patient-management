import dayjs, { Dayjs } from 'dayjs';
import { Column, Grid, Layer, Row, Tile } from '@carbon/react';
import { CalendarType } from '../../utils/types';
import { isSameMonth } from '../../functions/monthly';
import styles from './WeeklyTopCell.scss';
import React from 'react';
interface WeeklyCellProps {
  type: CalendarType;
  dateTime: Dayjs;
  currentDate: Dayjs;
  events: Array<any>;
  count?: number;
}

const WeeklyTopCell: React.FC<WeeklyCellProps> = ({ type, dateTime, currentDate, events, count }) => {
  const appointmentHashTable = new Map<string, Array<{ serviceName: string; count: number }>>([]);
  events?.map((appointment) => {
    const appointmentDate = dayjs(appointment.appointmentDate).format('YYYY-MM-DD');
    if (!appointmentHashTable.has(appointmentDate)) {
      appointmentHashTable.set(appointmentDate, [
        {
          serviceName: appointment.service.map((data) => data.serviceName),
          count: appointment.service.map((data) => data.count),
        },
      ]);
    }
  });
  const currentDateDetails = appointmentHashTable.get(dayjs(dateTime).format('YYYY-MM-DD'));
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
        <small className={styles['week-time']}></small>
      ) : type === 'monthly' ? (
        dateTime.format('D')
      ) : null}
      <p>{dateTime.format('dddd DD/MM')}</p>
      <p>{currentDateDetails?.map((event) => `${event.serviceName}-${event.count}`)}</p>
    </div>
  );
};
export default WeeklyTopCell;
