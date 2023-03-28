import { Button } from '@carbon/react';
import { Dayjs } from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { weekDays } from '../helpers';
import { CalendarType } from '../types';
import styles from './weekly-header.scss';

const Format = {
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
} as const;
const daysInWeek = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
const dateFormat = 'D MMM';
const monthFormat = 'MMMM, YYYY';
const yearFormat = 'YYYY';
function WeeklyHeader({
  type,
  currentDate,
  setCurrentDate,
  events,
}: {
  type: CalendarType;
  currentDate: Dayjs;
  setCurrentDate: (date: Dayjs) => void;
  events: { appointmentDate: string; service: Array<any>; [key: string]: any }[];
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.container}>
        <Button size="sm" onClick={() => setCurrentDate(currentDate.subtract(1, Format[type]))} kind="tertiary">
          {t('prev', 'Prev')}
        </Button>
        <span>
          {type === 'monthly'
            ? currentDate.format(monthFormat)
            : type === 'daily'
            ? currentDate.format(dateFormat)
            : `${currentDate.startOf('week').format(dateFormat)} - ${currentDate
                .endOf('week')
                .format(dateFormat)} , ${currentDate.format(yearFormat)}`}
        </span>
        <Button size="sm" onClick={() => setCurrentDate(currentDate.add(1, Format[type]))} kind="tertiary">
          {t('next', 'Next')}
        </Button>
      </div>
      <div className={styles.workLoadCard}>
        {weekDays(currentDate).map((dateTime, i) => (
          <>
            {i !== 0 && (
              <div tabIndex={0} role="button" className={`${styles.tileContainer} `}>
                <span>
                  {dateTime.format('dddd')} {dateTime.format('DD')}
                </span>
              </div>
            )}
          </>
        ))}
      </div>
    </>
  );
}
export default WeeklyHeader;
