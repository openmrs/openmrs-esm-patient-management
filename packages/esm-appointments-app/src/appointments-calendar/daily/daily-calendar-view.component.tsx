import React from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import styles from './daily-calendar.scss';
import { type CalendarType } from '../../types';
import { dailyHours } from '../../helpers';
import DailyHeader from './daily-header.component';
import DailyWorkloadView from './daily-view-workload.component';
dayjs.extend(isBetween);

interface DailyCalendarViewProps {
  type: CalendarType;
  events: { appointmentDate: string; service: Array<any>; [key: string]: any }[];
  currentDate: Dayjs;
  setCurrentDate: (date) => void;
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({
  type = 'daily',
  events,
  currentDate,
  setCurrentDate,
}) => {
  return (
    <div className={styles.container}>
      <DailyHeader type={type} currentDate={currentDate} setCurrentDate={setCurrentDate} events={events} />
      <div className={styles.wrapper}>
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
                    <small>{dateTime.minute(0).format('h a')}</small>
                  </div>
                  <div className={styles['empty-cell']}></div>
                </div>
              </>
            ))}
          </p>
        </>
      </div>
    </div>
  );
};

export default DailyCalendarView;
