/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import dayjs, { Dayjs } from 'dayjs';
import { CalendarType } from '../../utils/types';
import { isSameMonth } from '../../functions/monthly';
import styles from './MonthlyCell.module.scss';
import React, { useMemo } from 'react';
import { getStartDate, useAppointmentDate } from '../../../helpers';
import { useAllAppointments } from '../Resource/allAppointments.resource';

interface MonthlyCellProps {
  type: CalendarType;
  dateTime: Dayjs;
  currentDate: Dayjs;
  events: Array<any>;
  count?: number;
  onClick: () => void;
}

const MonthlyCell: React.FC<MonthlyCellProps> = ({ type, dateTime, currentDate, events, count, onClick }) => {
  const appointmentStartDate = getStartDate();
  const { allAppointments } = useAllAppointments();
  const appointmentHashTable = new Map<string, Array<{ serviceName: string; count: number }>>([]);
  const currentData = events?.find(
    (event) => dayjs(event.appointmentDate).format('YYYY-MM-DD') === dayjs(dateTime).format('YYYY-MM-DD'),
  );

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
      {type === 'monthly' ? (
        <p>
          {dateTime.format('D')} {''}
          {currentData?.service.map(({ serviceName, count }) => (
            <p>{`${serviceName}-${count}`}</p>
          ))}
        </p>
      ) : null}
    </div>
  );
};
export default MonthlyCell;
