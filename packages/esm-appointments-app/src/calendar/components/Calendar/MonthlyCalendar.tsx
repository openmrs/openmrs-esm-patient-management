import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { CalendarType } from '../../utils/types';
import styles from './Calendar.module.scss';

import { weekDays } from '../../functions/weekly';
import { monthDays } from '../../functions/monthly';
import MonthlyCell from '../Cell/MonthlyCell';
import MonthlyHeader from '../Header/MonthlyHeader';
dayjs.extend(isBetween);
function MonthlyCalendarView({
  type = 'monthly',
  events,
}: {
  type: CalendarType;
  events: { appointmentDate: string; service: Array<any>; [key: string]: any }[];
}) {
  const [currentDate, setCurrentDate] = useState(dayjs());

  return (
    <div>
      <MonthlyHeader type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} />
      <div className={styles.wrapper}>
        {type === 'monthly' ? (
          <div className={styles['monthly-calendar']}>
            {monthDays(currentDate).map((dateTime, i) => (
              <MonthlyCell
                type={type}
                key={i}
                dateTime={dateTime}
                currentDate={currentDate}
                events={events}
                onClick={function () {
                  alert('Function not implemented.');
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MonthlyCalendarView;
