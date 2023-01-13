import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import styles from './daily-calendar.scss';
import { CalendarType } from '../types';
import { dailyHours } from '../helpers';
import DailyHeader from './daily-header.component';
import DailyWorkloadView from './daily-view-workload.component';
dayjs.extend(isBetween);
function DailyCalendarView({
  type = 'daily',
  events,
}: {
  type: CalendarType;
  events: { appointmentDate: string; service: Array<any>; [key: string]: any }[];
}) {
  const [currentDate, setCurrentDate] = useState(dayjs());

  return (
    <div className={styles.container}>
      <DailyHeader type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} events={events} />
      <div className={styles.wrapper}>
        {type === 'daily' ? (
          <>
            <p className={styles['containerRow']}>
              <>
                <p className={styles['daily-calendar']}>
                  <DailyWorkloadView type={type} dateTime={currentDate} currentDate={currentDate} events={events} />
                </p>
              </>
            </p>
            <p className={styles['daily-calendar-all']}>
              {dailyHours(currentDate).map((dateTime, i) => (
                <>
                  <div className={styles.cellComponent}>
                    <div className={styles[type === 'daily' ? 'daily-cell' : '']}>
                      {type === 'daily' ? <small>{dateTime.minute(0).format('h a')}</small> : null}
                    </div>
                    <div className={styles['empty-cell']}></div>
                  </div>
                </>
              ))}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default DailyCalendarView;
